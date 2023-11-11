// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import fs from "node:fs";
import { $ } from "zx";
import { v4 as uuidv4 } from "uuid";
import _ from 'lodash';

import(/* webpackInclude: /ts-proto/ */ 'ts-proto'); // trick keep install ts-proto

const protocBin = process.env.NODE_ENV === 'development'
  ? path.resolve(process.cwd(), './bin', require('../../../bin/protoc')) // DEV bin/protoc....
  : path.resolve(process.cwd(), '.next/server/chunks/bin/protoc'); // BUILD .next/server/bin/protoc
  const tsProtoBin = process.env.NODE_ENV === 'development'
  ? path.resolve(process.cwd(), './bin', require('../../../bin/ts-proto')) // DEV bin/ts-proto....
  : path.resolve(process.cwd(), '.next/server/chunks/bin/ts-proto'); // BUILD .next/server/bin/ts-proto

enum STATUS_CODE {
  FAILURE = -1,
  SUCCESS = 0,

  /** 能修复-替换命名空间 */
  CAN_FIX_REPLACE_NAMESPACE = 1001,
}

export type Data = {
  status_code: STATUS_CODE;
  dts_code?: string;

  error?: string;
  fix_suggest?: {
    replace_namespace: object;
  };

  duration?: number;
};

function extractInterfacesAndEnums(tsContent: string) {
  // 定义用于匹配 interface 和 enum 的正则表达式
  const regex = /((export\s+)?(interface|enum)\s+[\w\d_]+\s*{[^}]*})/gs;
  const matches = tsContent.match(regex);

  return matches ? matches.join("\n\n") : "";
}

function escapeRegExp(string: string) {
  // 使用正则表达式替换特殊字符
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tryFixErr(err: any): null | Data['fix_suggest'] {
  /* 尝试解析 xxxx is not defined 并提供修复意见 */
  const regex = /"([^"]+)" is not defined/g;
  let match;
  const matches = [];
  // 循环匹配所有的结果
  while ((match = regex.exec((err as any)?.stderr)) !== null) {
    matches.push(match[1]);
  }
  if (matches.length > 0) {
    // aa.bb.cc -> Aa_Bb_Cc
    const convertToCustomFormat = (str: string) => _.startCase(_.toLower(str)).replace(/ /g, '_');
    // ['aaa', 'bbb'] => { aaa: xxx, bbb: xxx}
    const convertArrayToObject = (arr: string[]) => arr.reduce((acc, str) => ({ ...acc, [str]: convertToCustomFormat(str) }), {});

    return { replace_namespace: convertArrayToObject(matches) };
  }
  /* 尝试解析 xxxx is not defined 并提供修复意见 */

  return null;
}

async function transform(
  protoContent: string,
  extra: { replaceNamespace?: Record<string, string> }
) {
  const replaceNamespace = extra.replaceNamespace || {};

  const id = uuidv4();

  // 生成临时文件的路径
  const tempPath = path.resolve(process.env.EXECUTE_TEMP_DIR || './temp');
  const inputProtoFilePath = path.resolve(tempPath, `${id}.proto`);
  const outputTSFilePath = path.resolve(tempPath, `${id}.ts`);

  try {
    // 替换namespace
    Object.keys(replaceNamespace).forEach((replaceKEY) => {
      protoContent = protoContent.replace(
        new RegExp(escapeRegExp(replaceKEY), "g"),
        replaceNamespace[replaceKEY]
      );
    });

    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    // 将 .proto 内容写入临时文件
    let preContent = 'syntax = "proto3";\n';
    preContent += Object.values(replaceNamespace)
      .map((replaceValue) => `message ${replaceValue} {}`)
      .join("\n");
    fs.writeFileSync(inputProtoFilePath, preContent + protoContent);

    // 1.proto -> ts
    await $`${protocBin} --plugin=protoc-gen-ts=${tsProtoBin} -I=${tempPath} --ts_out=${tempPath}  ${inputProtoFilePath}`;
    // 2.保留 interface, enum
    fs.writeFileSync(
      outputTSFilePath,
      extractInterfacesAndEnums(fs.readFileSync(outputTSFilePath, "utf8"))
    );
    // 读取并返回转换后的内容
    return fs.readFileSync(outputTSFilePath, "utf8");
  } catch (err) {
    throw err;
  } finally {
    fs.existsSync(inputProtoFilePath) && fs.unlinkSync(inputProtoFilePath);
    fs.existsSync(outputTSFilePath) && fs.unlinkSync(outputTSFilePath);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const startTime = Date.now();
    const requestData = req.body as { proto_code: string; extra?: { replace_namespace?: Record<string, string> } }

    if (!requestData.proto_code) {
      return res.status(200).json({ status_code: STATUS_CODE.FAILURE, error: 'request body proto_code not found'})
    }

    const dtsCode = await transform(requestData.proto_code, { replaceNamespace: requestData.extra?.replace_namespace });
    return res.status(200).json({ status_code: STATUS_CODE.SUCCESS, dts_code: dtsCode, duration: Date.now() - startTime });
  } catch (err) {
    const fixSuggest = tryFixErr(err);
    if (fixSuggest) {
      return res.status(200).json({ status_code: STATUS_CODE.CAN_FIX_REPLACE_NAMESPACE, fix_suggest: fixSuggest });
    }

    return res.status(200).json({ status_code: STATUS_CODE.FAILURE, error: (err as any)?.stderr || (err as any)?.message });
  }
}

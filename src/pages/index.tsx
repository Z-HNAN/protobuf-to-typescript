import React from 'react';

import { type Data as TransformAPI_Data } from './api/transform';

const PLACEHOLDER = `
message Person {
  string name = 1;
  int32 id = 2;
  bool isFriend = 3;
  repeated PhoneNumber phones = 4;
}

message PhoneNumber {
  string number = 1;
  Other.Namespace.PhoneType type = 2;
}

message AddressBook {
  enum AddressBookType {
    Family = 0; // Tom, Amy
    Friend = 1; // Jay
  }

  AddressBookType address_book_type = 1;
  repeated Person people = 2;
}
`
enum STATUS_CODE {
  FAILURE = -1,
  SUCCESS = 0,

  /** 能修复-替换命名空间 */
  CAN_FIX_REPLACE_NAMESPACE = 1001,
}

export default function Home() {
  const protoRef = React.useRef<HTMLTextAreaElement>(null);
  const dtsRef = React.useRef<HTMLTextAreaElement>(null);
  const replaceNamespaceRef = React.useRef<HTMLTextAreaElement>(null);

  const [transformAPIRequesting, setTransformAPIRequesting] = React.useState(false);
  const [requestTip, setRequestTip] = React.useState<['tip' | 'warn' | 'error', string]>(['tip', '']);

  const handleTransform = async () => {
    if (!dtsRef.current || !protoRef.current || transformAPIRequesting) {
      return;
    }

    setRequestTip(['tip', 'transform....'])

    let replaceNamespace = {}
    try {
      replaceNamespace = JSON.parse(replaceNamespaceRef.current?.value || '{}')
    } catch (err) {}

    setTransformAPIRequesting(true);
    const data: TransformAPI_Data = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ proto_code: protoRef.current?.value, extra: { replace_namespace: replaceNamespace } }),
    }).then(res => res.json())
    setTransformAPIRequesting(false);

    if (data.status_code === STATUS_CODE.SUCCESS) {
      dtsRef.current.value = data.dts_code || '';
      setRequestTip(['tip', `success use ${data.duration} ms`])
    } else if (data.status_code === STATUS_CODE.CAN_FIX_REPLACE_NAMESPACE) {
      setRequestTip(['warn', 'no exist namespace, please input or use default']);
      replaceNamespaceRef.current && (replaceNamespaceRef.current.value = JSON.stringify(data.fix_suggest?.replace_namespace) || '');
    } else {
      setRequestTip(['error', data.error || '']);
    }
  }

  React.useEffect(() => {
    protoRef.current && (protoRef.current.value = PLACEHOLDER);
  }, []);

  return (
    <div id="container">
      <h1>Convert Protocol Buffers to TypeScript definition files.</h1>
      <div className="request-tips">
        <p className={requestTip[0]}>{requestTip[1]}</p>
        <textarea ref={replaceNamespaceRef}></textarea>
      </div>
      <div className="col">
        Protocol buffer: <button disabled={transformAPIRequesting} className='transform-button' onClick={handleTransform}>transform</button>
        <br />
        <textarea ref={protoRef} rows={40} />
      </div>
      <div className="col">
        Typescript d.ts:
        <br />
        <textarea ref={dtsRef} rows={40}></textarea>
      </div>
    </div>
  )
}

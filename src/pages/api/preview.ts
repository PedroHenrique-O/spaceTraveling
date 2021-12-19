/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export default function handler(req, res) {
  // ...
  res.setPreviewData({});
  res.end('Preview mode enabled');
  // ...
}

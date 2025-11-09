/** Return a "slice" of the schema containing only the allowed fields. */
export function sliceForAgency(schema, allowedFields) {
  const out = {};
  for (const key of allowedFields) {
    const parts = key.split('.');
    let src = schema, dst = out;
    for (let i=0; i<parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        if (src && typeof src === 'object' && p in src) {
          dst[p] = src[p];
        }
      } else {
        if (!(p in dst)) dst[p] = {};
        dst = dst[p];
        src = (src && src[p] !== undefined) ? src[p] : undefined;
      }
    }
  }
  return out;
}

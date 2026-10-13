function e(t){if(!t.picked||!t.layer)return null;const a=Math.max(t.index,0),r=t.arrow,o=r?`
batch ${(r.batchIndex+1).toLocaleString()} / batch row ${r.batchRowIndex.toLocaleString()}`:"";return`${t.layer.id}
row ${a.toLocaleString()}${o}`}export{e as g};

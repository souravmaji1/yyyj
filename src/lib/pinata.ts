/* Server-side only – Pinata JWT never reaches the browser */

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1Y2FhYjY5Yi1kZDcyLTRjODQtYWY3NS00N2E0NWJjNjkyZmUiLCJlbWFpbCI6ImRldndlYnRlc3RpbmcxNTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQ4NWIzNjIxYTUzOGM4MjI5YzVmIiwic2NvcGVkS2V5U2VjcmV0IjoiMThhNWY2OGI4ODcyMDBlMTY1ZWU4ZTRkMjE2MDEzZWE3MjY4N2RkYzViZjE2MzA2ZDE3ZTg4MDg1ZjBiY2QwMCIsImV4cCI6MTc4ODYyMTk0Nn0.DHJwvKIIo2Ih-NktZYx8XZSvTxJvppRgRWxC33TcZYQ';

export async function pinJSON(obj) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  });
  
  if (!res.ok) throw new Error("pinJSON failed");
  const data = await res.json();
  return data.IpfsHash; // returns CID only
}

      // keep it out of the bundle

type Metadata = Record<string, any>;

export async function pinJSONToFolder(
  fileName: string,
  metadata: Metadata,
  folder = 'metadata'
): Promise<string> {
  // 1. Build a File object that lives inside the folder
  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json',
  });
  const file = new File([blob], fileName, { type: 'application/json' });

  // 2. Pinata wants FormData
  const fd = new FormData();
  fd.append('file', file, `${folder}/${fileName}`);   // ← path inside IPFS

  // 3. Optional: give the pin a human-readable name
  fd.append('pinataMetadata', JSON.stringify({ name: folder }));

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Pinata error: ${txt}`);
  }

  const { IpfsHash } = await res.json();   // this is the folder-root CID
  return IpfsHash;                        // e.g. bafybeigk4H4Xx6...
}

export async function uploadToIPFS(file) {
  const fd = new FormData();
  fd.append("file", file);
  
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.uri;
}
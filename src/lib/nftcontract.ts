import { ethers } from "ethers";

const ABI = [
  "function mint(string metadataURI) returns (uint256)",
  "event Minted(address to, uint256 tokenId, string uri)",
];

export const NFT_ADDRESS = "0xfb56696CEB99183CCB33ACf56FbB78803CC2125f"; // your deployed addr

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(NFT_ADDRESS, ABI, signer);
}
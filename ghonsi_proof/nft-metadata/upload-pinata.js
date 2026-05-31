// upload-proof.js
import { PinataSDK } from "pinata-web3"

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNDBhYTQ4Yy1kZmNmLTQyODktODhlYi0zZDFjOTU5YzEzNGQiLCJlbWFpbCI6ImdqMDkwNDIwMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBkZDM4YzhmZTQyMWU0ZTc2Mjk1Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTdlNTZmOTE4ZjdjZTQzZmJlNWUwNmRjZmI1Y2RiYzkyZWE0Zjc5ZDI5OTA1MGM1NmY0ZTZmYmIwZjM3NzIzZSIsImV4cCI6MTc5OTMxNDg1MH0.zAc38ctn290vS1OrsEVuVEOeNTUafCEi88bhqcNXiU8'

const pinata = new PinataSDK({ pinataJwt: PINATA_JWT })

/**
 * Upload proof metadata to IPFS
 * @param {Object} proofData - The proof data
 * @returns {Promise<string>} - The IPFS URI
 */
export async function uploadProofMetadata({
    proofId,
    title,
    workDescription,
    proofType,
    imageUrl = 'https://via.placeholder.com/500' // Default placeholder
}) {
    const metadata = {
        name: title,
        description: workDescription,
        image: imageUrl,
        attributes: [
            { trait_type: "Proof ID", value: proofId },
            { trait_type: "Proof Type", value: proofType },
            { trait_type: "Status", value: "Pending" },
            { trait_type: "Submission Date", value: new Date().toISOString() }
        ]
    }

    console.log('📤 Uploading to IPFS...')

    const upload = await pinata.upload.json(metadata)
    const uri = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`

    console.log('✅ Uploaded! URI:', uri)

    return uri
}

// Test if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    uploadProofMetadata({
        proofId: "PROOF-002",
        title: "Full Stack E-commerce App",
        workDescription: "Built a complete e-commerce platform with payment integration",
        proofType: "Software Development"
    })
        .then(uri => console.log('\n🎉 Success! Use this URI in your Solana program:', uri))
        .catch(err => console.error('❌ Error:', err))
}
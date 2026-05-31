/**
 * Pinata IPFS Upload Utility
 * Uploads document data to Pinata's IPFS service via REST API
 * Uses the Pinata JWT from environment variables
 */

/**
 * Validate Pinata configuration
 * @throws {Error} If Pinata JWT is not configured
 */
const validatePinataConfig = () => {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;

  if (!jwt) {
    console.error('Pinata JWT not configured! Add NEXT_PUBLIC_PINATA_JWT to .env');
    throw new Error(
      'Pinata IPFS not configured. Please set NEXT_PUBLIC_PINATA_JWT environment variable. ' +
      'Get your JWT from https://dashboard.pinata.cloud'
    );
  }

  return jwt;
};

/**
 * Upload JSON metadata object to Pinata IPFS
 * @param {Object} documentData - The document extraction data to upload
 * @param {string} fileName - Optional file name for the upload
 * @returns {Promise<{hash: string, url: string}>} IPFS hash and gateway URL
 */
export const uploadToPinata = async (documentData, fileName = 'document-proof') => {
  try {
    const pinataJwt = validatePinataConfig();

    console.log('Uploading metadata JSON to Pinata IPFS:', fileName);

    const jsonData = JSON.stringify(documentData);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', blob, `${fileName}.json`);

    const metadata = {
      name: fileName,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        type: 'document-proof',
        appName: 'ghonsi-proof',
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    // FIX: use api.pinata.cloud, not uploads.pinata.cloud
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Pinata metadata upload error:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `Pinata upload failed: ${errorData.error?.reason || errorData.message || response.statusText}`
      );
    }

    const result = await response.json();

    console.log('Pinata metadata upload successful:', {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });

    return {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      timestamp: result.Timestamp,
    };
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
};

/**
 * Upload the actual File object (PDF/image/doc) to Pinata IPFS.
 * @param {File} file - The actual File object from the user's file input
 * @param {Object} keyvalues - Optional key-value pairs to tag the pin with
 * @returns {Promise<{hash: string, url: string}>}
 */
export const uploadFileToPinata = async (file, keyvalues = {}) => {
  try {
    const pinataJwt = validatePinataConfig();

    console.log('Uploading actual file to Pinata IPFS:', file.name);

    const formData = new FormData();
    formData.append('file', file, file.name);

    const metadata = {
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        type: 'document-proof-file',
        appName: 'ghonsi-proof',
        fileType: file.type,
        fileSize: String(file.size),
        ...keyvalues,
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    // FIX: use api.pinata.cloud, not uploads.pinata.cloud
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Pinata file upload error:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `Pinata file upload failed: ${errorData.error?.reason || errorData.message || response.statusText}`
      );
    }

    const result = await response.json();

    console.log('Pinata file upload successful:', {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });

    return {
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      timestamp: result.Timestamp,
    };
  } catch (error) {
    console.error('Pinata file upload error:', error);
    throw error;
  }
};

/**
 * Upload both the actual document file AND its metadata JSON to Pinata IPFS.
 * @param {File} file - The actual File object from the user's file input
 * @param {Object} documentData - Structured proof info
 * @param {Object} metadata - Transaction/session metadata
 * @returns {Promise<{hash, url, fileHash, fileUrl}>}
 */
export const uploadDocumentWithMetadata = async (file, documentData, metadata = {}) => {
  console.log('Starting dual Pinata upload: actual file + metadata JSON');

  // Step 1: Upload the real document file
  const fileResult = await uploadFileToPinata(file, {
    walletAddress: metadata.walletAddress || '',
    transactionHash: metadata.transactionHash || '',
  });

  // Step 2: Upload metadata JSON that references the file's IPFS hash
  const enrichedData = {
    ...documentData,
    fileIpfsHash: fileResult.hash,
    fileIpfsUrl: fileResult.url,
    metadata: {
      uploadedAt: new Date().toISOString(),
      ...metadata,
    },
  };

  const metadataResult = await uploadToPinata(enrichedData, `metadata-${Date.now()}`);

  console.log('Dual Pinata upload complete:', {
    fileHash: fileResult.hash,
    metadataHash: metadataResult.hash,
  });

  return {
    hash: metadataResult.hash,
    url: metadataResult.url,
    fileHash: fileResult.hash,
    fileUrl: fileResult.url,
  };
};

/**
 * Retrieve a file from IPFS via Pinata gateway
 * @param {string} ipfsHash - The IPFS hash (CID)
 * @returns {Promise<Object>} The retrieved document data
 */
export const retrieveFromPinata = async (ipfsHash) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log('Retrieving from Pinata:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to retrieve from Pinata: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Retrieved from Pinata successfully');
    return data;
  } catch (error) {
    console.error('Error retrieving from Pinata:', error);
    throw error;
  }
};

/**
 * Generate a Pinata gateway URL from IPFS hash
 * @param {string} ipfsHash - The IPFS hash
 * @returns {string} The gateway URL
 */
export const getPinataGatewayUrl = (ipfsHash) => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

/**
 * Alternative gateway URLs if Pinata gateway is down
 * @param {string} ipfsHash - The IPFS hash
 * @returns {Array<string>} Array of alternative gateway URLs
 */
export const getAlternativeGatewayUrls = (ipfsHash) => {
  return [
    `https://ipfs.io/ipfs/${ipfsHash}`,
    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    `https://dweb.link/ipfs/${ipfsHash}`,
    `https://ipfs.digitalocean.com/ipfs/${ipfsHash}`,
  ];
};

/**
 * Fetch from Pinata with fallback to alternative gateways
 * @param {string} ipfsHash - The IPFS hash
 * @returns {Promise<Object>} The retrieved data
 */
export const fetchFromPinataWithFallback = async (ipfsHash) => {
  const urls = [getPinataGatewayUrl(ipfsHash), ...getAlternativeGatewayUrls(ipfsHash)];
  let lastError;

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      console.log('Successfully fetched from:', url);
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`Failed to fetch from ${url}, trying next gateway...`);
    }
  }

  throw lastError || new Error('Failed to retrieve data from any IPFS gateway');
};
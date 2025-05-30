import * as grpc from "@grpc/grpc-js";
import {
  connect,
  Contract,
  hash,
  Identity,
  Signer,
  signers,
} from "@hyperledger/fabric-gateway";
import * as crypto from "crypto";
import { promises as fs } from "fs";
import * as path from "path";
import { TextDecoder } from "util";

// let gatewayInstance: any | null = null;
// let contractInstance: Contract | null = null;

const channelName = envOrDefault("CHANNEL_NAME", "main-channel");
const chaincodeName = envOrDefault("CHAINCODE_NAME", "basic");
const mspId = envOrDefault("MSP_ID", "hospitalaMSP");

// Path to crypto materials.
// const cryptoPath = envOrDefault(
//   "CRYPTO_PATH",
//   path.resolve(
//     __dirname,
//     "..",
//     "..",
//     "organizations",
//     "peerOrganizations",
//     "hospitala.example.com"
//   )
// );
const cryptoPath =
  // Boss ENV
  // "/Users/kb/Developer/2025/test_network_lending_med/organizations/peerOrganizations/hospitala.example.com";
  // Pup ENV
  '/Users/siwakorn.pup/project-hospital/backend/test_network_lending_med/organizations/peerOrganizations/hospitala.example.com';

// Path to user private key directory.
const keyDirectoryPath = envOrDefault(
  "KEY_DIRECTORY_PATH",
  path.resolve(
    cryptoPath,
    "users",
    "User1@hospitala.example.com",
    "msp",
    "keystore"
  )
);

// Path to user certificate directory.
const certDirectoryPath = envOrDefault(
  "CERT_DIRECTORY_PATH",
  path.resolve(
    cryptoPath,
    "users",
    "User1@hospitala.example.com",
    "msp",
    "signcerts"
  )
);

// Path to peer tls certificate.
const tlsCertPath = envOrDefault(
  "TLS_CERT_PATH",
  path.resolve(
    cryptoPath,
    "peers",
    "peer0.hospitala.example.com",
    "tls",
    "ca.crt"
  )
);

// Gateway peer endpoint.
const peerEndpoint = envOrDefault("PEER_ENDPOINT", "localhost:7051");

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault(
  "PEER_HOST_ALIAS",
  "peer0.hospitala.example.com"
);

const utf8Decoder = new TextDecoder();
const assetId = `asset${String(Date.now())}`;

async function initializeFabric(): Promise<any> {
//   if (contractInstance) {
//     return contractInstance; // Reuse existing contract instance
//   }

  // displayInputParameters();

  // Set up gRPC client
  const client = await newGrpcConnection();

  // Connect to Fabric Gateway
  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    hash: hash.sha256,
    // Default timeouts for different gRPC calls
    evaluateOptions: () => {
      return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    endorseOptions: () => {
      return { deadline: Date.now() + 15000 }; // 15 seconds
    },
    submitOptions: () => {
      return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    commitStatusOptions: () => {
      return { deadline: Date.now() + 60000 }; // 1 minute
    },
  });
  
  const network = gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeName);
  return contract;
}

async function newGrpcConnection(): Promise<grpc.Client> {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    "grpc.ssl_target_name_override": peerHostAlias,
  });
}

async function newIdentity(): Promise<Identity> {
  const certPath = await getFirstDirFileName(certDirectoryPath);
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function getFirstDirFileName(dirPath: string): Promise<string> {
  const files = await fs.readdir(dirPath);
  const file = files[0];
  if (!file) {
    throw new Error(`No files in directory: ${dirPath}`);
  }
  return path.join(dirPath, file);
}

async function newSigner(): Promise<Signer> {
  const keyPath = await getFirstDirFileName(keyDirectoryPath);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

function envOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function displayInputParameters(): void {
  console.log(`channelName:       ${channelName}`);
  console.log(`chaincodeName:     ${chaincodeName}`);
  console.log(`mspId:             ${mspId}`);
  console.log(`cryptoPath:        ${cryptoPath}`);
  console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
  console.log(`certDirectoryPath: ${certDirectoryPath}`);
  console.log(`tlsCertPath:       ${tlsCertPath}`);
  console.log(`peerEndpoint:      ${peerEndpoint}`);
  console.log(`peerHostAlias:     ${peerHostAlias}`);
}


export { initializeFabric };

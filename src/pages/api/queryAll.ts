import type { NextApiRequest, NextApiResponse } from "next";
// import { initializeFabric } from "../../../lib/fabricClient";
import { initializeFabric } from "../../lib/fabricClient";
import { TextDecoder } from "util";
import { verifyAuth } from '../../lib/auth';

const utf8Decoder = new TextDecoder();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // const now = new Date();
    // const contract = await initializeFabric();
    // const resultBytes = await contract.evaluateTransaction("GetAllMedicines");
    // const resultJson = utf8Decoder.decode(resultBytes);
    // const result = JSON.parse(resultJson);
    // //console.log(`*** Query All Assets committed successfully at ${now.toLocaleString()}`);
    //console.log('Querying all medicines...',process.env.ENDPOINT_URL);

    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/medicines/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.cookies.token || ''}`
      }
      }).then(async response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data from API');
        }
        const result = await response.json();
        return res.status(200).json({
          message: 'Query successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            hospitalName: user.hospitalName
          },
          result
        });
      }).catch(error => {
        //console.error('Error fetching data:', error);
        return res.status(500).json({
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });
    } catch (error) {
      //console.error('Error initializing Fabric:', error);
      return res.status(500).json({ message: 'Failed to initialize Fabric', error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    // return res.status(200).json({
    //   message: 'Query successful',
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //     name: user.name,
    //     hospitalName: user.hospitalName
    //   },
    //   result
    // });
  } catch (error) {
    //console.error('Query error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

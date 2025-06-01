import bcrypt from "bcrypt";
let mock: any;
export async function POST(req: any) {
    const {email, password} = await req.json();
    console.log("*** Transaction committed successfully",process.env.NEXT_PUBLIC_API_URL);
    const encryptedPassword =  await bcrypt.hash(password, 10); // Placeholder for encryption logic
    if (mock) {
        bcrypt.compare(mock, encryptedPassword).then((result: any) => {
            console.log("Password match result:", result);
        });
    }
    mock = password;

    try {
        return new Response(JSON.stringify({message: "Transaction committed successfully",
            result: {email, encryptedPassword}
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error during transaction:", error);
        return new Response(JSON.stringify({message: "Transaction failed"}), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
        
    }
    
}
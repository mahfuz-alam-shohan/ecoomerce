import { auth } from '../src/lib/auth/server';

async function main() {
  console.log('Testing auth.handler locally...');
  try {
    const req = new Request('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ecom.com',
        password: 'password123',
      }),
    });

    const res = await auth.handler(req);
    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err: any) {
    console.error('Caught error directly from auth.handler:', err);
  }
}

main().catch(console.error);

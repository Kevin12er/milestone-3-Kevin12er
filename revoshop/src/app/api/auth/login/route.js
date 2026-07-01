
import { NextResponse } from 'next/server';

export async function POST(request) {

	try {
    	const bodyData = await request.json();

    	const res = await fetch('https://api.escuelajs.co/api/v1/auth/login', {
      		method: 'POST',
     		headers: { 'Content-Type': 'application/json' },
      		body: JSON.stringify(bodyData), 
    	});

    	if (!res.ok) throw new Error('Gagal menambahkan produk ke server pusat');

    	const data = await res.json();
    
    	return NextResponse.json(data, { status: 201 });
  	} catch (error) {
    	return NextResponse.json({ error: error.message }, { status: 500 });
  	}


};


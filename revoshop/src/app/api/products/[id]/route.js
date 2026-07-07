import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/*PUT*/
export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  if (!cookieStore.get('revoshop_session')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bodyData = await request.json();
    const res = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    if (!res.ok) throw new Error('Gagal update produk');
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/*DELETE*/
export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  if (!cookieStore.get('revoshop_session')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Gagal hapus produk');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
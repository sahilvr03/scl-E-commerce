import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const flashSales = await db.collection('flashSales').find({}).toArray();
    return new Response(JSON.stringify(flashSales), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const flashSale = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      endDate: new Date(data.endDate), // Ensure endDate is stored as Date
    };
    const result = await db.collection('flashSales').insertOne(flashSale);
    return new Response(JSON.stringify({ ...flashSale, _id: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating flash sale:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(req) {
  try {
    const { db } = await connectToDatabase();
    const data = await req.json();
    const { id, ...updateData } = data;

    const result = await db.collection('flashSales').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Flash sale not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Flash sale updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error updating flash sale:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(req) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await req.json();

    const result = await db.collection('flashSales').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Flash sale not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Flash sale deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
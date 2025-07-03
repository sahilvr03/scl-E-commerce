import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid flash sale ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const flashSalesCollection = db.collection('flashSales');

    const flashSale = await flashSalesCollection.findOne({ _id: new ObjectId(id) });
    if (!flashSale) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 });
    }

    return NextResponse.json(flashSale, { status: 200 });
  } catch (error) {
    console.error('Flash sale GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flash sale', details: error.message },
      { status: 500 }
    );
  }
}
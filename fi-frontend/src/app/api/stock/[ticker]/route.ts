import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker;
    
    // Path to Python script (adjust as needed)
    const scriptPath = path.join(process.cwd(), '..', 'stock_data.py');
    
    // Execute Python script with ticker parameter
    const { stdout, stderr } = await execPromise(`python ${scriptPath} ${ticker}`);
    
    if (stderr) {
      console.error(`Error executing Python script: ${stderr}`);
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
    
    // Parse the JSON output from Python
    const stockData = JSON.parse(stdout);
    
    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Stock data error:', error);
    return NextResponse.json({ error: 'Failed to process stock data' }, { status: 500 });
  }
}
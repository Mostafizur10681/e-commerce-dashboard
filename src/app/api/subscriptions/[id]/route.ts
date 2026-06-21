import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/subscriptions.json');

async function loadSubscriptions() {
  try {
    const content = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    // If file missing, write mock data
    const mockSubscriptions = [
      {
        id: "sub-1001",
        userId: "u-001",
        name: "John Doe",
        email: "john@example.com",
        plan: "Basic",
        status: "Active",
        startDate: "2023-01-01",
        endDate: "2024-01-01",
        paymentStatus: "Paid",
        autoRenew: true,
      },
      {
        id: "sub-1002",
        userId: "u-002",
        name: "Jane Smith",
        email: "jane@example.com",
        plan: "Pro",
        status: "Expired",
        startDate: "2022-05-15",
        endDate: "2023-05-15",
        paymentStatus: "Failed",
        autoRenew: false,
      },
    ];
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(mockSubscriptions, null, 2), 'utf-8');
    return mockSubscriptions;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const subs = await loadSubscriptions();
  const sub = subs.find((s: any) => s.id === id);
  if (!sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }
  return NextResponse.json(sub);
}

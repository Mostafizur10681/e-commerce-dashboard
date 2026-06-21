import { NextResponse } from "next/server";
import { readCustomers, writeCustomers } from "../route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const body = await request.json();
    const { name, email, phone, ordersCount, status } = body;

    const customers = await readCustomers();
    const idx = customers.findIndex((c) => c.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const updatedCustomer = {
      ...customers[idx],
      name: name !== undefined ? name : customers[idx].name,
      email: email !== undefined ? email : customers[idx].email,
      phone: phone !== undefined ? phone : customers[idx].phone,
      ordersCount: ordersCount !== undefined ? Number(ordersCount) : customers[idx].ordersCount,
      status: status !== undefined ? status : customers[idx].status,
    };

    customers[idx] = updatedCustomer;
    await writeCustomers(customers);

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("PUT Customer Error:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const customers = await readCustomers();
    const filtered = customers.filter((c) => c.id !== id);

    if (customers.length === filtered.length) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await writeCustomers(filtered);
    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("DELETE Customer Error:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}

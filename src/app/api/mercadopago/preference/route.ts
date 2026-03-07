import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planName, price, restaurantName, email } = body;

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planName.toLowerCase(),
                        title: `Suscripción JAMALI OS - Plan ${planName}`,
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'COP'
                    }
                ],
                payer: {
                    email: email,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/wizard?step=5&status=success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/wizard?step=4&status=failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/wizard?step=4&status=pending`
                },
                auto_return: 'approved',
                metadata: {
                    restaurant_name: restaurantName,
                    plan: planName,
                    email: email
                }
            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });
    } catch (error: any) {
        console.error('Error creating MP preference:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

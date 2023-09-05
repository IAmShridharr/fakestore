import { NextResponse } from "next/server"
// @ts-ignore

import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
    const cartDetails = await request.json()
    // const lineItems = validateCartItems(inventory, cartDetails)
    const origin = request.headers.get('origin')

    // Initialize an empty array to store lineItems
    const lineItems = [];

    // Iterate over each product in cartDetails
    for (const productId in cartDetails) {
        if (cartDetails.hasOwnProperty(productId)) {
            const product = cartDetails[productId];

            // Create a line item for the current product and push it to lineItems array
            lineItems.push({
            price_data: {
                currency: product.currency,
                unit_amount: product.price,
                product_data: {
                    name: product.name
                },
            },
            quantity: product.quantity,
            });
        }
    }

    console.log(lineItems);

    const session = await stripe.checkout.sessions.create({
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ['card'],
        line_items: lineItems,
        shipping_address_collection: {
            allowed_countries: ['IN']
        },
        shipping_options: [
            {
                shipping_rate: "shr_1NmbJISAsN99q8ZQyvDCjGnC"
            }
        ],
        billing_address_collection: "auto",
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`
    })

    return NextResponse.json(session)
}

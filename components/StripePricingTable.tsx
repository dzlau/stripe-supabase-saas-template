"use client"
import React, { useState, useEffect } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
export default function StripePricingTable() {

    return (
        <stripe-pricing-table
            pricing-table-id={process.env.STRIPE_PRICING_TABLE_ID}
            publishable-key={process.env.STRIPE_PUBLISHABLE_KEY}
        >
        </stripe-pricing-table>
    )


};

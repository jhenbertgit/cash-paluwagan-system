"use client";
/*eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";

interface Props {
  amount: number;
  description: string;
}

const GCash = ({ amount, description }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [payProcess, setPayProcess] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC;
  if (!publicKey) {
    console.error("Public key for PayMongo is not set.");
  }

  // Function to Create A Source
  const createSource = async () => {
    try {
      setPaymentStatus("Creating Source...");
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(publicKey!).toString("base64")}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amount * 100,
              redirect: {
                success: "http://localhost:3000/payment/success",
                failed: "http://localhost:3000/payment/failed",
              },
              billing: { name, phone, email },
              type: "gcash",
              currency: "PHP",
              description: description,
            },
          },
        }),
      };

      const response = await fetch(
        "https://api.paymongo.com/v1/sources",
        options
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.errors?.map((err: any) => err.detail).join(", ")
        );
      }

      return result;
    } catch (error) {
      console.error("Error creating source:", error);
      setPaymentStatus("Error creating source. Please try again.");
      throw error;
    }
  };

  // Function to Listen to the Source in the Front End
  const listenToPayment = async (sourceId: string) => {
    for (let i = 5; i > 0; i--) {
      setPaymentStatus(`Listening to Payment in ${i}s...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (i === 1) {
        try {
          const response = await fetch(
            `https://api.paymongo.com/v1/sources/${sourceId}`,
            {
              headers: {
                Authorization: `Basic ${Buffer.from(publicKey!).toString(
                  "base64"
                )}`,
              },
            }
          );

          const sourceData = await response.json();

          if (sourceData.data.attributes.status === "failed") {
            setPaymentStatus("Payment Failed");
          } else if (sourceData.data.attributes.status === "paid") {
            setPaymentStatus("Payment Success");
          } else {
            i = 5; // Reset counter to keep listening
            setPayProcess(sourceData.data.attributes.status);
          }
        } catch (error) {
          console.error("Error listening to payment:", error);
          setPaymentStatus("Error listening to payment. Please try again.");
          break;
        }
      }
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const source = await createSource();
      window.open(source.data.attributes.redirect.checkout_url, "_blank");
      await listenToPayment(source.data.id);
    } catch (error) {
      console.error("Payment submission error:", error);
    }
  };

  return (
    <section>
      <form onSubmit={onSubmit}>
        <h2>Billing Information</h2>
        <div>
          <label htmlFor="customer-name">Customer Name:</label>
          <input
            id="customer-name"
            placeholder="Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Phone Number:</label>
          <input
            id="phone"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            placeholder="user@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Pay</button>
        <p>Payment Status: {paymentStatus}</p>
        <p>Pay Process: {payProcess}</p>
      </form>
    </section>
  );
};

export default GCash;

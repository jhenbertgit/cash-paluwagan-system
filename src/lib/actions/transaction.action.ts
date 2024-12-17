import { redirect } from "next/navigation";

export async function checkoutPayment({
  name,
  email,
}: CheckoutTransactionParams) {
  const secretKey = process.env.PAYMONGO_SECRET;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!secretKey) {
    console.error("Public key for PayMongo is not set.");
    throw new Error("PayMongo public key is missing.");
  }

  if (!serverUrl) {
    console.error("Server URL is not set.");
    throw new Error("Server URL is missing.");
  }

  const url = "https://api.paymongo.com/v1/checkout_sessions";

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Basic ${Buffer.from(secretKey).toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: {
            name: name,
            email: email,
          },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: [
            { currency: "PHP", quantity: 1, name: "Paluwagan", amount: 100000 },
          ],
          /* qrph, billease, card, dob, dob_ubp, brankas_bdo, brankas_landbank,
           * brankas_metrobank, gcash, grab_pay and paymaya
           */
          payment_method_types: ["gcash", "grab_pay", "paymaya", "card"],
          description: "Paluwagan",
          success_url: `${serverUrl}/dashboard`,
          cancel_url: `${serverUrl}/pay`,
        },
      },
    }),
  };

  try {
    const response = await fetch(url, options);

    // Handle non-successful responses
    if (!response.ok) {
      console.error("Error creating PayMongo session:", response.statusText);
      throw new Error(
        `Failed to create checkout session: ${response.statusText}`
      );
    }

    const session = await response.json();

    // Validate session data
    const checkoutUrl = session?.data?.attributes?.checkout_url;
    if (!checkoutUrl) {
      throw new Error("Checkout URL is missing in the PayMongo response.");
    }

    redirect(checkoutUrl);
  } catch (error) {
    console.error("An error occurred during checkout:", error);
    throw error;
  }
}

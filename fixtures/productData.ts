const date = new Date();
export const dateFomrat = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

export const products = [{ name: "Sony vaio i5", category: "Laptops" }];
export const validPaymentData = {
  Amount: "790 USD",
  CardNumber: "1234567890",
  Name: "John Doe",
  Date: dateFomrat,
  Country: "USA",
  City: "NYC",
  Month: "12",
  Year: "2025",
};

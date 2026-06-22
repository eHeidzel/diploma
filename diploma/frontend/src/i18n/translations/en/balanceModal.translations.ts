export interface IBalanceModalTranslations {
  title: string;
  infoTitle: string;
  infoDescription: string;
  amountLabel: string;
  amountPlaceholder: string;
  amountRequired: string;
  amountInteger: string;
  amountMin: string;
  amountMax: string;
  invalidAmount: string;
  presetAmounts: string;
  pay: string;
  success: string;
  error: string;
}

export const balanceModal: IBalanceModalTranslations = {
  title: "Top Up Balance",
  infoTitle: "Information",
  infoDescription: "Funds will be credited to your account after successful payment.",
  amountLabel: "Amount (BYN)",
  amountPlaceholder: "Enter amount in BYN",
  amountRequired: "Please enter the amount",
  amountInteger: "Please enter a positive integer",
  amountMin: "Minimum amount is 1 BYN",
  amountMax: "Maximum amount is 10000 BYN",
  invalidAmount: "Please enter a valid amount (greater than 0)",
  presetAmounts: "Quick amounts",
  pay: "Pay",
  success: "Balance topped up by {{amount}} BYN",
  error: "Error topping up balance",
};
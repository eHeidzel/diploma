import { IBalanceModalTranslations } from "../en/balanceModal.translations";

export const balanceModal: IBalanceModalTranslations = {
  title: "Пополнение баланса",
  infoTitle: "Информация",
  infoDescription: "Средства будут зачислены на ваш счет после успешной оплаты.",
  amountLabel: "Сумма пополнения (BYN)",
  amountPlaceholder: "Введите сумму в BYN",
  amountRequired: "Введите сумму пополнения",
  amountInteger: "Введите целое положительное число",
  amountMin: "Минимальная сумма 1 BYN",
  amountMax: "Максимальная сумма 10000 BYN",
  invalidAmount: "Введите корректную сумму (больше 0)",
  presetAmounts: "Быстрые суммы",
  pay: "Оплатить",
  success: "Баланс пополнен на {{amount}} BYN",
  error: "Ошибка при пополнении баланса",
};
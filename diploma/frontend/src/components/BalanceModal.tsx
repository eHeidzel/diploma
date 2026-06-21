
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  message,
} from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import { balanceApi } from "../services/api";
import styles from "../css/balance.module.css";

const { Text } = Typography;

interface BalanceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const BalanceModal: React.FC<BalanceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { amount: number }) => {
    const amount = Number(values.amount);
    if (isNaN(amount) || amount <= 0) {
      message.error("Введите корректную сумму (больше 0)");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending topup request:", { amount, paymentMethod: "card" });
      const response = await balanceApi.topUp(amount, "card");
      console.log("Topup response:", response.data);
      message.success(`Баланс пополнен на ${amount} BYN`);
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error("Error topping up balance:", error);
      console.error("Error response:", error.response?.data);
      message.error(
        error.response?.data?.message || "Ошибка при пополнении баланса",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePresetAmount = (amount: number) => {
    form.setFieldsValue({ amount });
    form.setFields([
      {
        name: "amount",
        errors: [],
      },
    ]);
  };

  return (
    <Modal
      title="Пополнение баланса"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={450}
      centered
      className={styles.balanceModal}
      destroyOnClose
    >
      <Alert
        message="Информация"
        description="Средства будут зачислены на ваш счет после успешной оплаты."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        validateTrigger="onSubmit"
      >
        <Form.Item
          name="amount"
          label="Сумма пополнения (BYN)"
          rules={[
            { required: true, message: "Введите сумму пополнения" },
            {
              pattern: /^\d+$/,
              message: "Введите целое положительное число",
            },
            {
              validator: (_, value) => {
                if (value && Number(value) < 1) {
                  return Promise.reject("Минимальная сумма 1 BYN");
                }
                if (value && Number(value) > 10000) {
                  return Promise.reject("Максимальная сумма 10000 BYN");
                }
                return Promise.resolve();
              },
            },
          ]}
          validateTrigger={["onSubmit", "onBlur"]}
        >
          <Input
            type="number"
            placeholder="Введите сумму в BYN"
            prefix={<CreditCardOutlined />}
            suffix="BYN"
            size="large"
            step="1"
            min="1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                form.submit();
              }
            }}
          />
        </Form.Item>

        <div className={styles.presetAmounts}>
          <Text type="secondary">Быстрые суммы:</Text>
          <Space wrap>
            {[50, 100, 200, 500].map((amount) => (
              <Button
                key={amount}
                onClick={() => handlePresetAmount(amount)}
                type="default"
              >
                {amount} BYN
              </Button>
            ))}
          </Space>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Оплатить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BalanceModal;

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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { amount: number }) => {
    const amount = Number(values.amount);
    if (isNaN(amount) || amount <= 0) {
      message.error(t("balanceModal.invalidAmount"));
      return;
    }

    setLoading(true);
    try {
      console.log("Sending topup request:", { amount, paymentMethod: "card" });
      const response = await balanceApi.topUp(amount, "card");
      console.log("Topup response:", response.data);
      message.success(t("balanceModal.success").replace("{{amount}}", String(amount)));
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error("Error topping up balance:", error);
      console.error("Error response:", error.response?.data);
      message.error(
        error.response?.data?.message || t("balanceModal.error"),
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
      title={t("balanceModal.title")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={450}
      centered
      className={styles.balanceModal}
      destroyOnClose
    >
      <Alert
        message={t("balanceModal.infoTitle")}
        description={t("balanceModal.infoDescription")}
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
          label={t("balanceModal.amountLabel")}
          rules={[
            { required: true, message: t("balanceModal.amountRequired") },
            {
              pattern: /^\d+$/,
              message: t("balanceModal.amountInteger"),
            },
            {
              validator: (_, value) => {
                if (value && Number(value) < 1) {
                  return Promise.reject(t("balanceModal.amountMin"));
                }
                if (value && Number(value) > 10000) {
                  return Promise.reject(t("balanceModal.amountMax"));
                }
                return Promise.resolve();
              },
            },
          ]}
          validateTrigger={["onSubmit", "onBlur"]}
        >
          <Input
            type="number"
            placeholder={t("balanceModal.amountPlaceholder")}
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
          <Text type="secondary">{t("balanceModal.presetAmounts")}:</Text>
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
            <Button onClick={onCancel}>{t("common.cancel")}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t("balanceModal.pay")}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BalanceModal;
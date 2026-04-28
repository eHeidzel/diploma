import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title } = Typography;

interface Subject {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface SubjectsProps {
  user?: any;
}

const Subjects: React.FC<SubjectsProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const colors = [
    "#52c41a",
    "#1890ff",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error("Ошибка загрузки предметов");
    }
  };

  const handleCreateSubject = async (values: any) => {
    setLoading(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, values);
        message.success("Предмет обновлён");
      } else {
        await api.post("/subjects", values);
        message.success("Предмет создан");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      message.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
      await api.delete(`/subjects/${id}`);
      message.success("Предмет удалён");
      fetchSubjects();
    } catch (error) {
      message.error("Ошибка удаления");
    }
  };

  const isTeacher = user?.role === "teacher";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3}>Предметы</Title>
        {isTeacher && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSubject(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            style={{ backgroundColor: "#52c41a" }}
          >
            Добавить предмет
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {subjects.map((subject) => (
          <Col xs={24} sm={12} md={8} lg={6} key={subject.id}>
            <Card
              hoverable
              style={{
                borderTop: `4px solid ${subject.color || colors[0]}`,
                borderRadius: 12,
              }}
              bodyStyle={{ padding: 20 }}
              actions={
                isTeacher
                  ? [
                      <EditOutlined
                        key="edit"
                        onClick={() => {
                          setEditingSubject(subject);
                          form.setFieldsValue(subject);
                          setIsModalOpen(true);
                        }}
                      />,
                      <DeleteOutlined
                        key="delete"
                        onClick={() => handleDeleteSubject(subject.id)}
                      />,
                    ]
                  : [
                      <Button
                        key="enroll"
                        type="link"
                        onClick={() =>
                          message.success(
                            `Вы записаны на предмет "${subject.name}"`,
                          )
                        }
                      >
                        Записаться
                      </Button>,
                    ]
              }
            >
              <Card.Meta
                avatar={
                  <BookOutlined
                    style={{ fontSize: 32, color: subject.color || colors[0] }}
                  />
                }
                title={
                  <span style={{ fontSize: 18, fontWeight: "bold" }}>
                    {subject.name}
                  </span>
                }
                description={
                  <div style={{ marginTop: 8, color: "#666" }}>
                    {subject.description || "Описание отсутствует"}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingSubject ? "Редактировать предмет" : "Новый предмет"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateSubject} layout="vertical">
          <Form.Item
            name="name"
            label="Название предмета"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input placeholder="Например: Математика" />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} placeholder="Краткое описание предмета" />
          </Form.Item>
          <Form.Item name="color" label="Цвет" initialValue={colors[0]}>
            <Space>
              {colors.map((color) => (
                <div
                  key={color}
                  onClick={() => form.setFieldsValue({ color })}
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    borderRadius: 8,
                    cursor: "pointer",
                    border:
                      form.getFieldValue("color") === color
                        ? "2px solid #000"
                        : "1px solid #ddd",
                  }}
                />
              ))}
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ backgroundColor: "#52c41a" }}
              >
                {editingSubject ? "Сохранить" : "Создать"}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subjects;


import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Tree,
  Row,
  Col,
  Empty,
  message,
} from "antd";
import {
  FolderOutlined,
  FileOutlined,
  LinkOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { materialsApi } from "../services/api";
import styles from "../css/materials.module.css";

const { Title } = Typography;

interface Material {
  id: number;
  title: string;
  type: "file" | "folder";
  category: string;
  link: string;
  access: string[];
}

interface MaterialsProps {
  user: any;
}

const Materials: React.FC<MaterialsProps> = ({ user }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await materialsApi.getAll();
      let filteredMaterials = response.data;

      
      if (isStudent) {
        filteredMaterials = response.data.filter((m: Material) =>
          m.access?.includes("student"),
        );
      }
      if (isTeacher) {
        filteredMaterials = response.data.filter((m: Material) =>
          m.access?.includes("teacher"),
        );
      }
      setMaterials(filteredMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      message.error("Ошибка загрузки материалов");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDriveLink = () => {
    window.open(
      "https://drive.google.com/drive/folders/codezone-materials",
      "_blank",
    );
  };

  
  const categories = [...new Set(materials.map((m) => m.category))];

  
  const typeFilters = [
    { text: "Файл", value: "file" },
    { text: "Папка", value: "folder" },
  ];

  const categoryFilters = categories.map((cat) => ({ text: cat, value: cat }));

  
  const treeData = materials.reduce((acc: any[], material) => {
    const category = material.category;
    const existingCategory = acc.find((item) => item.key === category);
    if (existingCategory) {
      existingCategory.children.push({
        key: material.id.toString(),
        title: material.title,
        icon:
          material.type === "folder" ? <FolderOutlined /> : <FileOutlined />,
        isLeaf: true,
        link: material.link,
      });
    } else {
      acc.push({
        key: category,
        title: category,
        icon: <FolderOutlined />,
        children: [
          {
            key: material.id.toString(),
            title: material.title,
            icon:
              material.type === "folder" ? (
                <FolderOutlined />
              ) : (
                <FileOutlined />
              ),
            isLeaf: true,
            link: material.link,
          },
        ],
      });
    }
    return acc;
  }, []);

  const columns = [
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
      sorter: (a: Material, b: Material) => a.title.localeCompare(b.title),
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag
          icon={type === "folder" ? <FolderOutlined /> : <FileOutlined />}
          color={type === "folder" ? "blue" : "green"}
        >
          {type === "folder" ? "Папка" : "Файл"}
        </Tag>
      ),
      filters: typeFilters,
      onFilter: (value: any, record: Material) => record.type === value,
    },
    {
      title: "Категория",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Tag>{category}</Tag>,
      filters: categoryFilters,
      onFilter: (value: any, record: Material) => record.category === value,
    },
    {
      title: "Ссылка",
      dataIndex: "link",
      key: "link",
      render: (link: string) => (
        <Button type="link" icon={<LinkOutlined />} href={link} target="_blank">
          Открыть
        </Button>
      ),
    },
  ];

  const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
    if (info.node.link) {
      window.open(info.node.link, "_blank");
    }
    setSelectedKeys(selectedKeys as string[]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>Учебные материалы</Title>
        <Button icon={<GoogleOutlined />} onClick={handleGoogleDriveLink}>
          Google Диск
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Категории" className={styles.treeCard}>
            {treeData.length > 0 ? (
              <Tree
                treeData={treeData}
                defaultExpandAll
                onSelect={handleTreeSelect}
                selectedKeys={selectedKeys}
              />
            ) : (
              <Empty description="Нет материалов" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Список материалов">
            <Table
              columns={columns}
              dataSource={materials}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Materials;

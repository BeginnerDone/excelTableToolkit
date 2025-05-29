import type {
  TableAdapter,
  TableColumn,
  AdapterOptions,
  CopyPasteCallbacks,
} from './types';
import { BaseTableAdapter } from './adapters/BaseTableAdapter';
import { NativeTableAdapter } from './adapters/NativeTableAdapter';
import { ExcelTableAdapter } from './adapters/ExcelTableAdapter';

/**
 * 适配器配置接口
 */
export interface AdapterConfig {
  /** 适配器类型 */
  type: 'native' | 'ant-design-vue' | 'element-plus' | 'custom';
  /** 表格元素或组件实例 */
  target?: HTMLTableElement | any;
  /** 列配置 */
  columns: TableColumn[];
  /** 适配器选项 */
  options?: AdapterOptions;
  /** 回调函数 */
  callbacks?: CopyPasteCallbacks;
  /** 自定义适配器类（当 type 为 'custom' 时使用） */
  customAdapter?: new (...args: any[]) => TableAdapter;
}

/**
 * 创建表格适配器
 */
export function createTableAdapter(config: AdapterConfig): TableAdapter {
  const { type, target, columns, options = {}, callbacks = {}, customAdapter } = config;

  switch (type) {
    case 'native':
      if (!(target instanceof HTMLTableElement)) {
        throw new Error('Native adapter requires HTMLTableElement as target');
      }
      return new NativeTableAdapter(target, columns, options);

    case 'ant-design-vue':
      // 动态导入 Ant Design Vue 适配器
      return createAntDesignVueAdapter(target, columns, options, callbacks);

    case 'element-plus':
      // 动态导入 Element Plus 适配器
      return createElementPlusAdapter(target, columns, options, callbacks);

    case 'custom':
      if (!customAdapter) {
        throw new Error('Custom adapter class is required when type is "custom"');
      }
      return new customAdapter(target, columns, options, callbacks);

    default:
      throw new Error(`Unsupported adapter type: ${type}`);
  }
}

/**
 * 创建 Ant Design Vue 适配器
 */
function createAntDesignVueAdapter(
  target: any,
  columns: TableColumn[],
  options: AdapterOptions,
  callbacks: CopyPasteCallbacks
): TableAdapter {
  // 这里可以动态导入 Ant Design Vue 适配器
  // 为了保持核心库的轻量，这里提供一个基础实现
  
  class AntDesignVueAdapter extends BaseTableAdapter {
    name = 'ant-design-vue';
    private tableRef: any;

    constructor() {
      super(options);
      this.tableRef = target;
    }

    getTableData() {
      // 从 Ant Design Vue Table 组件获取数据
      // 这里需要根据实际的组件 API 来实现
      const dataSource = this.tableRef?.dataSource || [];
      return {
        rows: dataSource,
        columns,
      };
    }

    setTableData(data: any) {
      // 设置 Ant Design Vue Table 组件数据
      if (this.tableRef && typeof this.tableRef.setDataSource === 'function') {
        this.tableRef.setDataSource(data.rows);
      }
    }

    getSelectedData() {
      // 获取选中的数据
      const selectedRows = this.tableRef?.selectedRows || [];
      return {
        rows: selectedRows,
        columns,
      };
    }

    setSelectedData(data: any) {
      // 设置选中的数据
      if (this.tableRef && typeof this.tableRef.setSelectedRows === 'function') {
        this.tableRef.setSelectedRows(data.rows);
      }
    }
  }

  return new AntDesignVueAdapter();
}

/**
 * 创建 Element Plus 适配器
 */
function createElementPlusAdapter(
  target: any,
  columns: TableColumn[],
  options: AdapterOptions,
  callbacks: CopyPasteCallbacks
): TableAdapter {
  // 这里可以动态导入 Element Plus 适配器
  // 为了保持核心库的轻量，这里提供一个基础实现
  
  class ElementPlusAdapter extends BaseTableAdapter {
    name = 'element-plus';
    private tableRef: any;

    constructor() {
      super(options);
      this.tableRef = target;
    }

    getTableData() {
      // 从 Element Plus Table 组件获取数据
      const data = this.tableRef?.data || [];
      return {
        rows: data,
        columns,
      };
    }

    setTableData(data: any) {
      // 设置 Element Plus Table 组件数据
      if (this.tableRef) {
        this.tableRef.data = data.rows;
      }
    }

    getSelectedData() {
      // 获取选中的数据
      const selection = this.tableRef?.selection || [];
      return {
        rows: selection,
        columns,
      };
    }

    setSelectedData(data: any) {
      // 设置选中的数据
      if (this.tableRef && typeof this.tableRef.toggleRowSelection === 'function') {
        // 清除现有选择
        this.tableRef.clearSelection();
        // 选择新的行
        data.rows.forEach((row: any) => {
          this.tableRef.toggleRowSelection(row, true);
        });
      }
    }
  }

  return new ElementPlusAdapter();
}

/**
 * 创建 Excel 适配器
 */
export function createExcelAdapter(
  options: AdapterOptions = {},
  callbacks: CopyPasteCallbacks = {}
): ExcelTableAdapter {
  return new ExcelTableAdapter(options, callbacks);
}

/**
 * 注册自定义适配器
 */
const customAdapters = new Map<string, new (...args: any[]) => TableAdapter>();

export function registerAdapter(
  name: string,
  adapterClass: new (...args: any[]) => TableAdapter
): void {
  customAdapters.set(name, adapterClass);
}

/**
 * 获取已注册的适配器
 */
export function getRegisteredAdapter(
  name: string
): (new (...args: any[]) => TableAdapter) | undefined {
  return customAdapters.get(name);
}

/**
 * 获取所有已注册的适配器名称
 */
export function getRegisteredAdapterNames(): string[] {
  return Array.from(customAdapters.keys());
}

/**
 * 检查适配器是否已注册
 */
export function isAdapterRegistered(name: string): boolean {
  return customAdapters.has(name);
}
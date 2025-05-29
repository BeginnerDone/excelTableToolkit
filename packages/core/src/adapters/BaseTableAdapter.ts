import type {
  TableAdapter,
  TableData,
  TableColumn,
  AdapterOptions,
} from '../types';
import { ExcelTableAdapter } from './ExcelTableAdapter';

/**
 * 基础表格适配器抽象类
 * 为不同 UI 库的表格组件提供统一的接口
 */
export abstract class BaseTableAdapter implements TableAdapter {
  abstract name: string;
  protected excelAdapter: ExcelTableAdapter;
  protected options: AdapterOptions;

  constructor(options: AdapterOptions = {}) {
    this.options = options;
    this.excelAdapter = new ExcelTableAdapter(options);
  }

  /**
   * 从表格组件获取数据
   */
  abstract getTableData(): TableData | Promise<TableData>;

  /**
   * 设置表格组件数据
   */
  abstract setTableData(data: TableData): void | Promise<void>;

  /**
   * 获取选中的数据（可选实现）
   */
  getSelectedData?(): TableData | Promise<TableData>;

  /**
   * 设置选中的数据（可选实现）
   */
  setSelectedData?(data: TableData): void | Promise<void>;

  /**
   * 从剪贴板粘贴数据
   */
  async pasteFromClipboard(columns: TableColumn[]): Promise<void> {
    const tableData = await this.excelAdapter.pasteFromClipboard(columns);
    await this.setTableData(tableData);
  }

  /**
   * 复制数据到剪贴板
   */
  async copyToClipboard(): Promise<void> {
    const tableData = await this.getTableData();
    await this.excelAdapter.copyToClipboard(tableData);
  }

  /**
   * 复制选中数据到剪贴板
   */
  async copySelectedToClipboard(): Promise<void> {
    if (!this.getSelectedData) {
      throw new Error('此适配器不支持选中数据操作');
    }
    const selectedData = await this.getSelectedData();
    await this.excelAdapter.copyToClipboard(selectedData);
  }

  /**
   * 粘贴数据到选中区域
   */
  async pasteToSelected(columns: TableColumn[]): Promise<void> {
    if (!this.setSelectedData) {
      throw new Error('此适配器不支持选中数据操作');
    }
    const tableData = await this.excelAdapter.pasteFromClipboard(columns);
    await this.setSelectedData(tableData);
  }

  /**
   * 导入 Excel 文件
   */
  async importFromExcel(file: File, columns: TableColumn[]): Promise<void> {
    const tableData = await this.excelAdapter.importFromExcel(file, columns);
    await this.setTableData(tableData);
  }

  /**
   * 导出到 Excel 文件
   */
  async exportToExcel(filename?: string): Promise<void> {
    const tableData = await this.getTableData();
    await this.excelAdapter.exportToExcel(tableData, filename);
  }

  /**
   * 获取 Excel 适配器实例
   */
  getExcelAdapter(): ExcelTableAdapter {
    return this.excelAdapter;
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Partial<AdapterOptions>): void {
    this.options = { ...this.options, ...options };
    this.excelAdapter.updateOptions(this.options);
  }
}
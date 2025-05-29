import type { TableData, TableColumn, TableRow } from '../types';
import { BaseTableAdapter } from './BaseTableAdapter';

/**
 * 原生 HTML 表格适配器
 * 支持原生 HTML table 元素的数据交换
 */
export class NativeTableAdapter extends BaseTableAdapter {
  name = 'native-table';
  private tableElement: HTMLTableElement;
  private columns: TableColumn[];

  constructor(
    tableElement: HTMLTableElement,
    columns: TableColumn[],
    options = {}
  ) {
    super(options);
    this.tableElement = tableElement;
    this.columns = columns;
  }

  /**
   * 从原生表格获取数据
   */
  getTableData(): TableData {
    const rows: TableRow[] = [];
    const tbody = this.tableElement.querySelector('tbody');
    
    if (!tbody) {
      return { rows, columns: this.columns };
    }

    const tableRows = tbody.querySelectorAll('tr');
    
    tableRows.forEach((tr, index) => {
      const cells = tr.querySelectorAll('td');
      const row: TableRow = { id: index };
      
      this.columns.forEach((column, colIndex) => {
        const cell = cells[colIndex];
        if (cell) {
          const value = this.extractCellValue(cell, column);
          row[column.key] = value;
        }
      });
      
      rows.push(row);
    });

    return { rows, columns: this.columns };
  }

  /**
   * 设置原生表格数据
   */
  setTableData(data: TableData): void {
    const { rows } = data;
    
    // 清空现有数据
    this.clearTableBody();
    
    // 创建或获取 tbody
    let tbody = this.tableElement.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      this.tableElement.appendChild(tbody);
    }

    // 添加数据行
    rows.forEach(row => {
      const tr = document.createElement('tr');
      
      this.columns.forEach(column => {
        const td = document.createElement('td');
        const value = row[column.key];
        this.setCellValue(td, value, column);
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
  }

  /**
   * 获取选中的数据
   */
  getSelectedData(): TableData {
    const selectedRows: TableRow[] = [];
    const tbody = this.tableElement.querySelector('tbody');
    
    if (!tbody) {
      return { rows: selectedRows, columns: this.columns };
    }

    // 查找选中的行（假设使用 .selected 类名标识选中状态）
    const selectedTrs = tbody.querySelectorAll('tr.selected');
    
    selectedTrs.forEach((tr, index) => {
      const cells = tr.querySelectorAll('td');
      const row: TableRow = { id: index };
      
      this.columns.forEach((column, colIndex) => {
        const cell = cells[colIndex];
        if (cell) {
          const value = this.extractCellValue(cell, column);
          row[column.key] = value;
        }
      });
      
      selectedRows.push(row);
    });

    return { rows: selectedRows, columns: this.columns };
  }

  /**
   * 设置选中的数据
   */
  setSelectedData(data: TableData): void {
    // 这里可以实现更复杂的选中区域数据设置逻辑
    // 简单实现：替换所有选中行的数据
    const { rows } = data;
    const tbody = this.tableElement.querySelector('tbody');
    
    if (!tbody) return;

    const selectedTrs = tbody.querySelectorAll('tr.selected');
    
    rows.forEach((row, index) => {
      const tr = selectedTrs[index];
      if (tr) {
        const cells = tr.querySelectorAll('td');
        
        this.columns.forEach((column, colIndex) => {
          const cell = cells[colIndex];
          if (cell) {
            const value = row[column.key];
            this.setCellValue(cell, value, column);
          }
        });
      }
    });
  }

  /**
   * 创建表头
   */
  createHeader(): void {
    // 清空现有表头
    const existingThead = this.tableElement.querySelector('thead');
    if (existingThead) {
      existingThead.remove();
    }

    // 创建新表头
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    
    this.columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.title;
      if (column.width) {
        th.style.width = `${column.width}px`;
      }
      tr.appendChild(th);
    });
    
    thead.appendChild(tr);
    this.tableElement.insertBefore(thead, this.tableElement.firstChild);
  }

  /**
   * 添加行选择功能
   */
  enableRowSelection(multiple = true): void {
    this.tableElement.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tr = target.closest('tr');
      
      if (tr && tr.parentElement?.tagName === 'TBODY') {
        if (multiple && (event.ctrlKey || event.metaKey)) {
          // 多选模式
          tr.classList.toggle('selected');
        } else {
          // 单选模式
          const tbody = tr.parentElement;
          tbody.querySelectorAll('tr.selected').forEach(selectedTr => {
            selectedTr.classList.remove('selected');
          });
          tr.classList.add('selected');
        }
      }
    });
  }

  /**
   * 提取单元格值
   */
  private extractCellValue(cell: HTMLTableCellElement, column: TableColumn): any {
    // 检查是否有输入元素
    const input = cell.querySelector('input, select, textarea') as HTMLInputElement;
    if (input) {
      return this.parseValue(input.value, column);
    }
    
    // 获取文本内容
    const text = cell.textContent?.trim() || '';
    return this.parseValue(text, column);
  }

  /**
   * 设置单元格值
   */
  private setCellValue(
    cell: HTMLTableCellElement,
    value: any,
    column: TableColumn
  ): void {
    // 检查是否有输入元素
    const input = cell.querySelector('input, select, textarea') as HTMLInputElement;
    if (input) {
      input.value = this.formatValue(value, column);
      return;
    }
    
    // 如果列是可编辑的，创建输入元素
    if (column.editable) {
      const input = document.createElement('input');
      input.type = this.getInputType(column);
      input.value = this.formatValue(value, column);
      cell.innerHTML = '';
      cell.appendChild(input);
    } else {
      // 设置文本内容
      cell.textContent = this.formatValue(value, column);
    }
  }

  /**
   * 解析值
   */
  private parseValue(value: string, column: TableColumn): any {
    if (!value) return null;
    
    switch (column.dataType) {
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }

  /**
   * 格式化值
   */
  private formatValue(value: any, column: TableColumn): string {
    if (value == null) return '';
    
    switch (column.dataType) {
      case 'date':
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return String(value);
      default:
        return String(value);
    }
  }

  /**
   * 获取输入类型
   */
  private getInputType(column: TableColumn): string {
    switch (column.dataType) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  /**
   * 清空表格主体
   */
  private clearTableBody(): void {
    const tbody = this.tableElement.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '';
    }
  }

  /**
   * 更新列配置
   */
  updateColumns(columns: TableColumn[]): void {
    this.columns = columns;
    this.createHeader();
  }

  /**
   * 获取表格元素
   */
  getTableElement(): HTMLTableElement {
    return this.tableElement;
  }
}
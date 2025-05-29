import type { ClipboardData } from '../types';

/**
 * 剪贴板操作工具类
 */
export class ClipboardUtils {
  /**
   * 读取剪贴板数据
   */
  static async readClipboard(): Promise<ClipboardData> {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      const clipboardItems = await navigator.clipboard.read();
      const clipboardItem = clipboardItems[0];
      
      if (!clipboardItem) {
        throw new Error('No clipboard data available');
      }

      const result: ClipboardData = { text: '' };

      // 读取纯文本
      if (clipboardItem.types.includes('text/plain')) {
        const textBlob = await clipboardItem.getType('text/plain');
        result.text = await textBlob.text();
      }

      // 读取 HTML
      if (clipboardItem.types.includes('text/html')) {
        const htmlBlob = await clipboardItem.getType('text/html');
        result.html = await htmlBlob.text();
      }

      // 解析结构化数据
      if (result.text) {
        result.structured = this.parseTabDelimitedData(result.text);
      }

      return result;
    } catch (error) {
      // 降级到传统方法
      return this.readClipboardLegacy();
    }
  }

  /**
   * 写入剪贴板数据
   */
  static async writeClipboard(data: ClipboardData): Promise<void> {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      const clipboardItems: ClipboardItem[] = [];
      const blobData: Record<string, Blob> = {};

      // 添加纯文本
      if (data.text) {
        blobData['text/plain'] = new Blob([data.text], { type: 'text/plain' });
      }

      // 添加 HTML
      if (data.html) {
        blobData['text/html'] = new Blob([data.html], { type: 'text/html' });
      }

      if (Object.keys(blobData).length > 0) {
        clipboardItems.push(new ClipboardItem(blobData));
        await navigator.clipboard.write(clipboardItems);
      }
    } catch (error) {
      // 降级到传统方法
      await this.writeClipboardLegacy(data.text);
    }
  }

  /**
   * 传统方式读取剪贴板（降级方案）
   */
  private static async readClipboardLegacy(): Promise<ClipboardData> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        return {
          text,
          structured: this.parseTabDelimitedData(text),
        };
      }
    } catch (error) {
      console.warn('Failed to read clipboard:', error);
    }

    // 最后的降级方案：提示用户手动粘贴
    const text = prompt('请粘贴数据:') || '';
    return {
      text,
      structured: this.parseTabDelimitedData(text),
    };
  }

  /**
   * 传统方式写入剪贴板（降级方案）
   */
  private static async writeClipboardLegacy(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (error) {
      console.warn('Failed to write clipboard:', error);
    }

    // 最后的降级方案：使用临时文本域
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * 解析制表符分隔的数据
   */
  private static parseTabDelimitedData(
    text: string
  ): (string | number | boolean | null)[][] {
    if (!text.trim()) return [];

    return text
      .split('\n')
      .filter(line => line.trim())
      .map(line => 
        line.split('\t').map(cell => {
          const trimmed = cell.trim();
          
          // 尝试解析为数字
          if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return parseFloat(trimmed);
          }
          
          // 尝试解析为布尔值
          if (trimmed.toLowerCase() === 'true') return true;
          if (trimmed.toLowerCase() === 'false') return false;
          
          // 空值处理
          if (trimmed === '') return null;
          
          return trimmed;
        })
      );
  }

  /**
   * 检查剪贴板 API 是否可用
   */
  static isClipboardSupported(): boolean {
    return !!navigator.clipboard;
  }

  /**
   * 检查是否有剪贴板读取权限
   */
  static async checkClipboardPermission(): Promise<boolean> {
    try {
      if (!navigator.permissions) return false;
      
      const permission = await navigator.permissions.query({ 
        name: 'clipboard-read' as PermissionName 
      });
      
      return permission.state === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * 请求剪贴板权限
   */
  static async requestClipboardPermission(): Promise<boolean> {
    try {
      // 尝试读取剪贴板来触发权限请求
      await navigator.clipboard.readText();
      return true;
    } catch (error) {
      return false;
    }
  }
}
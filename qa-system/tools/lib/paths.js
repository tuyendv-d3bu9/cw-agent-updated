/**
 * lib/paths.js — Nguồn chân lý duy nhất về đường dẫn thư mục của dự án.
 *
 * Trước đây mỗi tool tự tính `ROOT_DIR` bằng `path.resolve(__dirname, '../..')`.
 * Sau khi tool được gom vào thư mục con, độ sâu đã khác nhau — tự tính sẽ sai.
 * Mọi tool bắt buộc lấy đường dẫn từ đây, không tự dựng lại.
 */

const path = require('path');
const fs = require('fs');

// lib/ nằm ở qa-system/tools/lib → lùi 3 cấp là gốc repo.
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  ROOT: ROOT_DIR,
  INPUT: path.join(ROOT_DIR, 'INPUT'),
  OUTPUT: path.join(ROOT_DIR, 'OUTPUT'),
  KNOWLEDGE: path.join(ROOT_DIR, 'knowledge'),
  FEATURES: path.join(ROOT_DIR, 'knowledge', 'features'),
  SYSTEM: path.join(ROOT_DIR, 'qa-system'),
  AGENTS: path.join(ROOT_DIR, 'qa-system'), // bí danh cũ, giữ cho tương thích
  TOOLS: path.join(ROOT_DIR, 'qa-system', 'tools'),
  TEMPLATES: path.join(ROOT_DIR, 'qa-system', 'templates'),
  AUTOMATION: path.join(ROOT_DIR, 'automation'),
  SYSTEM_MAP: path.join(ROOT_DIR, 'knowledge', '_system_map.json'),
  ENV_FILE: path.join(ROOT_DIR, '.env'),
};

/** Thư mục kết quả của một task. */
function taskDir(slug) {
  return path.join(PATHS.OUTPUT, slug);
}

/** File tri thức của một tính năng — luôn nằm dưới `knowledge/features/`. */
function featureKnowledge(slug) {
  return path.join(PATHS.FEATURES, `${slug}.md`);
}

/**
 * Liệt kê các task-slug đang có trong OUTPUT/.
 * Bỏ qua thư mục hệ thống (`_` đứng đầu) và bản sao lưu (`.bak`).
 */
function listTaskSlugs() {
  if (!fs.existsSync(PATHS.OUTPUT)) return [];
  return fs.readdirSync(PATHS.OUTPUT).filter((name) => {
    if (name.startsWith('_') || name.endsWith('.bak')) return false;
    return fs.statSync(path.join(PATHS.OUTPUT, name)).isDirectory();
  });
}

module.exports = { PATHS, taskDir, featureKnowledge, listTaskSlugs };

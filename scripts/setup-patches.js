const fs = require('fs');
const path = require('path');

// 1. Patch rollup
const rollupNativePath = path.join(__dirname, '..', 'node_modules', 'rollup', 'dist', 'native.js');
if (fs.existsSync(rollupNativePath)) {
  let content = fs.readFileSync(rollupNativePath, 'utf8');
  if (!content.includes('@rollup/wasm-node/dist/native.js')) {
    content = content.replace(
      /const nativeModule = requireWithFriendlyError\([\s\S]*?\);/,
      `let nativeModule;\ntry {\n\tnativeModule = requireWithFriendlyError(\n\t\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`\n\t);\n} catch (e) {\n\ttry {\n\t\tnativeModule = require('@rollup/wasm-node/dist/native.js');\n\t} catch (e2) {\n\t\tthrow e;\n\t}\n}`
    );
    fs.writeFileSync(rollupNativePath, content, 'utf8');
    console.log('Patched rollup for wasm fallback.');
  }
}

// 2. Patch Next.js SWC loader
const nextSwcPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'swc', 'index.js');
if (fs.existsSync(nextSwcPath)) {
  let content = fs.readFileSync(nextSwcPath, 'utf8');
  let changed = false;

  if (content.includes('Array.isArray(a) && a.every((m)=>m.includes("it was not installed"))')) {
    content = content.replace(
      /if \(Array\.isArray\(a\) && a\.every\(\(m\)=>m\.includes\("it was not installed"\)\)\) {[\s\S]*?attempts = attempts\.concat\(a\);\s*}/,
      `attempts = attempts.concat(a);\n            try {\n                const fallbackBindings = await tryLoadWasmWithFallback(attempts);\n                if (fallbackBindings) {\n                    return resolve(fallbackBindings);\n                }\n            } catch (_) {}`
    );
    changed = true;
  }

  if (content.includes('let pkgPath = pkg;\n            if (importPath) {') && !content.includes('require.resolve(pkg)')) {
    content = content.replace(
      'let pkgPath = pkg;\n            if (importPath) {\n                // the import path must be exact when not in node_modules\n                pkgPath = _path.default.join(importPath, pkg, "wasm.js");\n            }',
      'let pkgPath = pkg;\n            if (importPath) {\n                // the import path must be exact when not in node_modules\n                pkgPath = _path.default.join(importPath, pkg, "wasm.js");\n            } else {\n                try {\n                    pkgPath = require.resolve(pkg);\n                } catch (_) {}\n            }'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(nextSwcPath, content, 'utf8');
    console.log('Patched Next.js SWC for wasm fallback.');
  }
}

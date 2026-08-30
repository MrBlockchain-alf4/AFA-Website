'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { NAV_TREES, sectionOf } from '@/lib/kundenzugang-nav';
import { useContentStore } from '@/lib/kundenzugang-store';
import { cn, hexToRgba } from '@/lib/utils';

export default function NavTree() {
  const selectedField = useContentStore((s) => s.selectedField);
  const setSelectedField = useContentStore((s) => s.setSelectedField);
  const currentPage = useContentStore((s) => s.currentPage);
  const navTree = NAV_TREES[currentPage];
  // AFA's own brand cyan — kundenzugang is AFA's product, not themed per client.
  const accent = '#00D4FF';
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ hero: true, services: true });

  // Figma-style: whenever the selection changes (nav click, or a click
  // inside the live iframe), make sure its parent section is open — the
  // user shouldn't have to manually expand a collapsed section to see what
  // just got selected.
  useEffect(() => {
    const section = sectionOf(selectedField);
    if (!section) return;
    setExpanded((e) => (e[section] ? e : { ...e, [section]: true }));
  }, [selectedField]);

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3">
      {navTree.map((node) => {
        const hasChildren = !!node.children?.length;
        const isOpen = expanded[node.id];
        const isSelected = selectedField === node.id;

        return (
          <div key={node.id}>
            <button
              onClick={() =>
                hasChildren
                  ? setExpanded((e) => ({ ...e, [node.id]: !e[node.id] }))
                  : setSelectedField(node.id)
              }
              className={cn(
                'group flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
                !isSelected && 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
              )}
              style={isSelected ? { backgroundColor: hexToRgba(accent, 0.1), color: accent } : undefined}
            >
              {hasChildren && (
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-shrink-0 text-zinc-600"
                >
                  <ChevronRight size={13} />
                </motion.span>
              )}
              {!hasChildren && <span className="w-[13px] flex-shrink-0" />}
              <span className="truncate">{node.label}</span>
              {node.live ? (
                <span
                  title="Saves reach the live site"
                  className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              ) : (
                <span
                  title="Draft only — the live site's HTML has no hook for this section yet"
                  className="ml-auto flex-shrink-0 rounded border border-white/10 px-1.5 py-[1px] text-[9px] font-medium uppercase tracking-wide text-zinc-600"
                >
                  Draft
                </span>
              )}
            </button>

            <AnimatePresence initial={false}>
              {hasChildren && isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="ml-[19px] flex flex-col gap-0.5 border-l border-white/10 pl-3 py-0.5">
                    {node.children!.map((leaf) => {
                      const leafSelected = selectedField === leaf.id;
                      return (
                        <button
                          key={leaf.id}
                          onClick={() => setSelectedField(leaf.id)}
                          className={cn(
                            'rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors',
                            leafSelected ? 'font-medium' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300',
                          )}
                          style={leafSelected ? { backgroundColor: hexToRgba(accent, 0.1), color: accent } : undefined}
                        >
                          {leaf.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

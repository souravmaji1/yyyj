'use client';

import { AppDispatch } from "@/src/store";
import { fetchTags } from "@/src/store/slices/tag.Slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '@/src/store';

const TagList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const { items: tags, loading: tagsLoading, error: tagsError } = useSelector((state: RootState) => state.tags);

    useEffect(() => {
        dispatch(fetchTags({ page: 1, limit: 15 }));
    }, [dispatch]);

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => setSelectedTag(null)}
                className={`
                    px-4 py-2 rounded-lg capitalize ${!selectedTag
                        ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg !transition-none"
                        : "bg-[var(--color-surface)] hover:text-[var(--color-primary)] hover:!shadow-none"
                    } transition-all duration-200 flex items-center gap-2 text-white`}
            >
                ALL PRODUCTS
            </button>

            {/* {tagsLoading ? (
                <>Loading...</>
            ) : tags && tags.length > 0 ? (
                tags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => {
                            setSelectedTag(tag.name);
                        }}
                        className={`
                            px-4 py-2 rounded-lg capitalize ${selectedTag === tag.name
                                ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg !transition-none"
                                : "bg-[var(--color-surface)] hover:text-[var(--color-primary)] hover:!shadow-none"
                            } transition-all duration-200 flex items-center gap-2 text-white`}
                    >
                        {tag.icon && <tag.icon className="w-4 h-4" />}
                        {tag.name}
                    </button>
                ))
            ) : (
                <div className="text-gray-400">No tags found</div>
            )} */}
        </div>
    );
};

export default TagList;
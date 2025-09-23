export const truncateText = (text: any, wordLimit: any) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const words = cleanText.split(/\s+/);

    if (words.length <= wordLimit) return cleanText;
    return words.slice(0, wordLimit).join(" ") + "...";
};
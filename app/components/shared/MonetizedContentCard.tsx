import { getFileIcon } from '@/app/lib/frontend/explorerFunctions';
import { formatDate, formatFileSize, formatPrice, getContentTypeColor, getContentTypeLabel } from '@/app/lib/frontend/monetizedContentUtils';
import { FaFolder } from 'react-icons/fa';

interface MonetizedContentCardProps {
  content: {
    _id: string;
    title: string;
    description?: string;
    type: 'public' | 'monetized';
    price?: number;
    item: {
      name: string;
      type: 'file' | 'folder';
      size?: number;
      mimeType?: string;
    };
    accessCount?: number;
    paidUsers?: string[];
    createdAt: Date;
    expiresAt?: Date;
  };
  onCopy?: () => void;
  onView?: () => void;
  onPurchase?: () => void;
  showStats?: boolean;
  className?: string;
}

export default function MonetizedContentCard({
  content,
  onCopy,
  onView,
  onPurchase,
  showStats = false,
  className = ''
}: MonetizedContentCardProps) {
  const FileIcon = content?.item?.type === 'folder' ? FaFolder : getFileIcon(content.item?.mimeType || '');

  return (
    <div className={`bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-6 h-full rounded-lg ${className}`}>
      <div className="flex flex-col space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="text-3xl shrink-0 text-white">
            <FileIcon />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-freeman font-semibold mb-1 truncate text-white">{content?.title}</h3>
            <p className="text-sm font-freeman truncate text-slate-300">
              {content?.item?.name}
              {content?.item?.size && ` • ${formatFileSize(content?.item?.size)}`}
            </p>
          </div>
        </div>

        {/* Type and Price */}
        <div className="flex items-center gap-3">
          {/* <span className={`px-3 py-1 border-2 border-black font-freeman inline-block ${getContentTypeColor(content?.type)}`}>
            {getContentTypeLabel(content?.type)}
          </span> */}
          {content?.type === 'monetized' && content?.price && (
            <span className="font-freeman bg-green-900 text-green-200 border-2 border-green-600 px-3 py-1 rounded">
              {formatPrice(content?.price)}
            </span>
          )}
        </div>

        {/* Description */}
        {content?.description && (
          <div className="font-freeman">
            <p className="text-sm line-clamp-2 text-slate-300">{content?.description}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-auto pt-4">
          {/* Stats */}
          {showStats && (
            <div className="font-freeman flex gap-4">
              <p className="text-sm text-slate-300">{content?.accessCount || 0} views</p>
              {/* {content?.type === 'monetized' && (
                <p className="text-sm">
                  {content.paidUsers?.length || 0} paid
                </p>
              )} */}
            </div>
          )}

          {/* Date */}
          <div className="font-freeman ml-auto">
            <p className="text-sm text-slate-400">
              Created {formatDate(content?.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {(onCopy || onView || onPurchase) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {onCopy && (
              <button
                onClick={onCopy}
                className="px-4 py-2 border-2 border-slate-600 font-freeman bg-slate-700 button-primary text-white hover:bg-slate-600 rounded"
              >
                Copy Link
              </button>
            )}
            {onView && (
              <button
                onClick={onView}
                className="px-4 py-2 border-2 border-slate-600 font-freeman bg-slate-700 button-primary text-white hover:bg-slate-600 rounded"
              >
                View
              </button>
            )}
            {onPurchase && content?.type === 'monetized' && (
              <button
                onClick={onPurchase}
                className="px-4 py-2 border-2 border-slate-600 font-freeman neopop-gradient-primary button-primary ml-auto text-white hover:neopop-glow rounded"
              >
                Purchase
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
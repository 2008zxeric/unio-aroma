-- 给 reviews 表增加 rating 列
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 给已有的评论默认设为 5 星
UPDATE public.reviews SET rating = 5 WHERE rating IS NULL;

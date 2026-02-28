"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { SignInModal } from "@/components/features/SignInModal";

interface Review {
    id: string;
    hostName: string;
    eventId: string;
    eventTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface OrganizerReviewsProps {
    hostName: string;
    hostAvatar: string;
    eventId: string;
    eventTitle: string;
    canReview: boolean; // true when the current user has RSVP'd
}

function StarRating({
    value,
    onChange,
    readonly = false,
    size = "md",
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
    size?: "sm" | "md";
}) {
    const [hovered, setHovered] = useState(0);
    const dim = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hovered || value) >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={readonly ? "cursor-default" : "cursor-pointer"}
                        aria-label={`${star} star`}
                    >
                        <Star
                            className={`${dim} transition-colors ${
                                filled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/40"
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export function OrganizerReviews({
    hostName,
    hostAvatar,
    eventId,
    eventTitle,
    canReview,
}: OrganizerReviewsProps) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);

    useEffect(() => {
        fetch(`/api/reviews?hostName=${encodeURIComponent(hostName)}`)
            .then(r => r.json())
            .then(setReviews)
            .catch(() => {});
    }, [hostName]);

    const alreadyReviewed = reviews.some(r => r.eventId === eventId);

    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

    async function handleSubmit() {
        if (rating === 0 || comment.trim() === "") return;
        setSubmitting(true);
        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId, hostName, eventTitle, rating, comment: comment.trim() }),
        });
        if (res.ok) {
            const { id } = await res.json();
            const newReview: Review = {
                id,
                hostName,
                eventId,
                eventTitle,
                rating,
                comment: comment.trim(),
                createdAt: new Date().toISOString(),
            };
            setReviews(prev => [newReview, ...prev]);
            setRating(0);
            setComment("");
        }
        setSubmitting(false);
    }

    return (
        <section className="space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Organizer Reviews</h3>
                {avgRating !== null && (
                    <div className="flex items-center gap-1.5">
                        <StarRating value={Math.round(avgRating)} readonly size="sm" />
                        <span className="text-sm font-medium text-muted-foreground">
                            {avgRating.toFixed(1)} ({reviews.length})
                        </span>
                    </div>
                )}
            </div>

            {/* Sign-in prompt when not authenticated */}
            {canReview && !session && (
                <div className="rounded-xl border border-dashed p-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Sign in to leave a review for this organizer.</p>
                    <Button size="sm" variant="outline" onClick={() => setShowSignIn(true)}>
                        Sign In to Review
                    </Button>
                    <SignInModal
                        open={showSignIn}
                        onClose={() => setShowSignIn(false)}
                        message="Sign in to leave a review"
                    />
                </div>
            )}

            {/* Review form */}
            {canReview && session && !alreadyReviewed && (
                <div className="rounded-xl border bg-card p-4 space-y-3">
                    <p className="text-sm font-medium">
                        How was {hostName} as an organizer?
                    </p>
                    <StarRating value={rating} onChange={setRating} />
                    <Textarea
                        placeholder="Share your experience with this organizer…"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="resize-none text-sm"
                    />
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={rating === 0 || comment.trim() === "" || submitting}
                    >
                        {submitting ? "Submitting…" : "Submit Review"}
                    </Button>
                </div>
            )}

            {alreadyReviewed && canReview && session && (
                <p className="text-sm text-muted-foreground">
                    You&apos;ve already reviewed this organizer for this event.
                </p>
            )}

            {!canReview && (
                <p className="text-sm text-muted-foreground">
                    RSVP to this event to leave a review.
                </p>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>
            ) : (
                <ul className="space-y-3">
                    {reviews.map((review) => (
                        <li
                            key={review.id}
                            className="rounded-xl border bg-card p-4 space-y-2"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={hostAvatar} alt={hostName} />
                                    <AvatarFallback>{hostName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium">Anonymous Attendee</span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            @ {review.eventTitle}
                                        </span>
                                    </div>
                                    <StarRating value={review.rating} readonly size="sm" />
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                                {review.comment}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

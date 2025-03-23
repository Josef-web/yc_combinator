import {client} from "@/sanity/lib/client";
import {PLAYLIST_BY_SLUG_QUERY, STARTUP_BY_ID_QUERY} from "@/sanity/lib/queries";
import {notFound} from "next/navigation";
import {formatDate} from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import markdownit from 'markdown-it';
import {Skeleton} from "@/components/ui/skeleton";
import {Suspense} from "react";
import View from "@/components/View";
import StartupCard, {StartupTypeCard} from "@/components/StartupCard";

const md = markdownit();

export const experimental_ppr = true;

const Page = async ({params}: { params: Promise<{ id: string }> }) => {

    const id = (await params).id;

    const [startup, { select: editorPosts }] = await Promise.all([
        client.fetch(STARTUP_BY_ID_QUERY, {id}),
        client.fetch(PLAYLIST_BY_SLUG_QUERY, {
            slug: 'editor-picks'
        }),
    ]);

    if (!startup) return notFound();

    const parsedContent = md.render(startup?.pitch || '');

    return (
        <>
            <section className="pink_container !min-h-[230px]">
                <p className="tag">{formatDate(startup?._createdAt)}</p>
                <h1 className="heading">{startup.title}</h1>
                <p className="sub-heading !max-w-5xl">{startup.description}</p>
            </section>

            <section className="section_container">
                <img
                    src={startup.image}
                    alt="thumbnail"
                    className="w-full h-auto rounded-xl"
                />

                <div className="space-y-5 mt-10 max-w-4xl mx-auto">
                    <div className="flex-between gap-5">
                        <Link href={`/user/${startup.author?._id}`}
                              className="flex gap-2 items-center mb-3">
                            <Image
                                src={startup.author.image}
                                alt="avatar"
                                width={64}
                                height={64}
                                className="rounded-full drop-shadow-lg border-2"
                            />
                            <div>
                                <p className="text-20-medium">{startup.author.name}</p>
                                <p className="text-16-medium !tex-black-300">
                                    @{startup.author.username}
                                </p>
                            </div>
                        </Link>
                        <p className="category-tag">{startup.category}</p>
                    </div>
                    <h3 className="text-30-bold">Pitch Details</h3>
                    {parsedContent ? (
                        <article
                            className="prose max-w-4xl font-work-sans break-all"
                            dangerouslySetInnerHTML={{__html: parsedContent}}/>
                    ) : (
                        <p className="no-result">No details provided</p>
                    )}
                </div>

                <hr className="divider"/>

                {editorPosts?.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <p className="text-30-semibold">Editor Picks</p>

                        <ul className="mt-7 card_grid_sm">
                            {editorPosts?.map((startup: StartupTypeCard, i: number) => (
                                <StartupCard key={i} post={startup}/>
                            ))}
                        </ul>
                    </div>
                )}

                <Suspense fallback={<Skeleton className="view_skeleton"/>}>
                    <View id={id}/>
                </Suspense>
            </section>
        </>
    );
};

export default Page;
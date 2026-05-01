"use client";

const VIDEOS = [
  { id: "ENdAWT6N0V4", title: "Alpha School Overview" },
  { id: "ULpQs-5LMvE", title: "Student Testimonial" },
];

export function VideoSection() {
  return (
    <section className="wp-video">
      <div className="wp-video-inner">
        <h2 className="wp-video-heading">See Alpha in Action</h2>
        <p className="wp-video-subtitle">
          Watch what a day at Alpha really looks like
        </p>
        <div className="wp-video-grid">
          {VIDEOS.map((video) => (
            <div key={video.id} className="wp-video-embed">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

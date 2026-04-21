import { useEffect } from "react";
import "./Blogs.css";

const blogPosts = [
  {
    image: "/blog-images/thank-you.svg",
    title: "A Heartfelt Thank You",
    excerpt:
      "To every person who has ever rolled up their sleeve: thank you. You are the silent heroes of our healthcare system. Your generosity provides hope...",
    category: "Awareness",
    readTime: "4 min read",
  },
  {
    image: "/blog-images/fitness.svg",
    title: "Blood Donation and Fitness",
    excerpt:
      "Athletes often worry that donating will hurt their performance. While your aerobic capacity might be slightly reduced for a few days, there are no long-term effects.",
    category: "Health Tips",
    readTime: "5 min read",
  },
  {
    image: "/blog-images/illness.svg",
    title: "Chronic Illness and Blood Needs",
    excerpt:
      "Patients with illnesses like sickle cell disease require regular transfusions every few weeks just to survive. For them, blood isn’t just for emergencies...",
    category: "Patient Care",
    readTime: "6 min read",
  },
  {
    image: "/blog-images/business.svg",
    title: "The Business of Saving Lives",
    excerpt:
      "Corporate partnerships and workplace blood drives are vital. They create a culture of giving and make it convenient for employees to donate.",
    category: "Community",
    readTime: "4 min read",
  },
  {
    image: "/blog-images/first-time.svg",
    title: "First-Time Donating Blood: Tips",
    excerpt:
      "Feeling nervous? That’s normal! Here are a few tips for a smooth experience: hydrate well, eat a healthy meal, and bring a friend for support.",
    category: "Beginner Guide",
    readTime: "3 min read",
  },
  {
    image: "/blog-images/community.svg",
    title: "The Power of Community",
    excerpt:
      "Blood donation is a collective effort. It brings together people from all walks of life for a single, noble cause: to help others in their time of need.",
    category: "Awareness",
    readTime: "5 min read",
  },
];

const Blogs = () => {
  useEffect(() => {
    document.title = "BloodFlow Blogs | Blood Donation Awareness";
  }, []);

  return (
    <section
      className="blogs-container"
      aria-label="Blood donation awareness blogs"
    >
      <div className="blogs-header">
        <h1 className="blogs-title">All Blogs</h1>
        <p className="blogs-subtitle">
          Read inspiring stories and essential guides about blood donation.
        </p>
        <div className="blogs-separator"></div>
      </div>
      <div className="blogs-grid">
        {blogPosts.map((post, index) => (
          <article key={index} className="blog-card">
            <img
              src={post.image}
              alt={post.title}
              className="blog-card-image"
            />
            <div className="blog-card-content">
              <div className="blog-meta-row">
                <span>{post.category}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <a href="#" className="blog-card-read-more">
                READ FULL BLOG →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Blogs;

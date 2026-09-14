

const AboutDiary = () => {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
         <h2 className="text-2xl sm:text-3xl md:text-4xl font-garamond font-medium text-pearl-mist px-4">
           About Lunara
         </h2>

         <div className="space-y-4 sm:space-y-6 text-base sm:text-lg font-garamond leading-relaxed text-soft-gray">
           <p className="max-w-3xl mx-auto px-4">
             Lunara is not a blog. It is not a magazine. It is a private journal—one that exists
             in the liminal space between quiet reflection and gentle self-discovery.
           </p>

           <p className="max-w-3xl mx-auto px-4">
             Here, we explore the landscape of inner life: the weight of emotions,
             the beauty of awareness, and the gentle art of self-reflection.
             These are the thoughts that visit at night, the observations we make in
             stillness, the patterns we notice in our minds.
           </p>

           <p className="max-w-2xl mx-auto italic text-muted-stardust px-4">
             "For those who feel deeply, think carefully, and wonder often."
           </p>
        </div>
      </div>
    </section>
  );
};

export default AboutDiary;

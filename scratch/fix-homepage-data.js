const getHomePageData = unstable_cache(
  async () => {
    try {
      const db = await getDb();
      
      const results = await Promise.all([
        // 1. Featured colleges
        db.collection("collegeprofile").aggregate([
          { $match: { isShowOnHome: 1 } },
          { $limit: 8 },
          { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              id: 1,
              slug: 1,
              name: {
                $cond: [
                  { $and: [{ $ne: ["$user.firstname", null] }, { $ne: [{ $trim: { input: "$user.firstname" } }, ""] }] },
                  { $trim: { input: "$user.firstname" } },
                  "$slug",
                ],
              },
              location: "$registeredSortAddress",
              image: "$bannerimage",
              rating: 1,
            },
          },
          {
            $lookup: {
              from: "collegemaster",
              localField: "id",
              foreignField: "collegeprofile_id",
              as: "cm",
            },
          },
          {
            $lookup: {
              from: "functionalarea",
              localField: "cm.functionalarea_id",
              foreignField: "id",
              as: "fa",
            },
          },
          {
            $project: {
              _id: 0,
              slug: 1,
              name: 1,
              location: 1,
              image: 1,
              rating: 1,
              streams: { $slice: [{ $setUnion: ["$fa.name", []] }, 6] },
            },
          },
        ]).toArray() as Promise<CollegeRow[]>,

        // 2. Latest active blogs
        db.collection("blogs")
          .find({ isactive: 1 })
          .sort({ created_at: -1 })
          .limit(8)
          .project({ _id: 0, id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
          .toArray() as Promise<DbBlog[]>,

        // 3. Top exams
        db.collection("examination_details")
          .find({})
          .sort({ totalViews: -1, created_at: -1 })
          .limit(8)
          .project({ _id: 0, id: 1, title: 1, slug: 1, exminationDate: 1, image: 1, functionalarea_id: 1, courses_id: 1, totalViews: 1 })
          .toArray() as Promise<DbExam[]>,

        // 4. Active home-page ads (general)
        db.collection("ads_managements")
          .find({
            $or: [
              { ads_position: "home" },
              { ads_position: " home" },
              { ads_position: "default" },
              { ads_position: " default" },
            ],
            $and: [{
              $or: [{ isactive: 1 }, { isactive: "1" }, { isactive: " 1" }]
            }],
          })
          .sort({ created_at: -1 })
          .limit(8)
          .project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
          .toArray() as Promise<AdItem[]>,

        // 4a. Home Partner ads
        db.collection("ads_managements")
          .find({
            $or: [{ ads_position: "home_partner" }, { ads_position: " home_partner" }],
            $and: [{$or: [{ isactive: 1 }, { isactive: "1" }, { isactive: " 1" }]}]
          })
          .sort({ created_at: -1 }).limit(8).project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
          .toArray() as Promise<AdItem[]>,

        // 4b. Home Featured ads
        db.collection("ads_managements")
          .find({
            $or: [{ ads_position: "home_featured" }, { ads_position: " home_featured" }],
            $and: [{$or: [{ isactive: 1 }, { isactive: "1" }, { isactive: " 1" }]}]
          })
          .sort({ created_at: -1 }).limit(8).project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
          .toArray() as Promise<AdItem[]>,

        // 5. Stats counts
        Promise.all([
          db.collection("collegeprofile").estimatedDocumentCount(),
          db.collection("next_student_signups").estimatedDocumentCount(),
          db.collection("country").estimatedDocumentCount(),
          db.collection("course").estimatedDocumentCount(),
        ]),

        // 6. Testimonials
        (async () => {
          const [rows] = await pool.query(
            `SELECT id, author, misc, description, featuredimage
             FROM testimonials
             WHERE author IS NOT NULL AND description IS NOT NULL
             ORDER BY created_at DESC
             LIMIT ?`,
            [8],
          ) as [TestimonialRow[], unknown];
          return rows;
        })(),
      ]);

      const [collegeRows, blogRows, examRows, adRows, partnerAds, featuredAds, statCounts, testimonialRows] = results;

      // 7. Ticker ads (home_ticker position)
      const tickerAdRows = await db.collection("ads_managements")
        .find({
          $or: [
            { ads_position: "home_ticker" },
            { ads_position: " home_ticker" },
          ],
          $and: [{
            $or: [{ isactive: 1 }, { isactive: "1" }, { isactive: " 1" }]
          }],
        })
        .sort({ created_at: -1 })
        .limit(20)
        .project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
        .toArray() as TickerAdItem[];

      return { collegeRows, blogRows, examRows, adRows, partnerAds, featuredAds, statCounts, tickerAdRows, testimonialRows };
    } catch (error) {
      console.error("[getHomePageData] Database error:", error);
      return {
        collegeRows: [],
        blogRows: [],
        examRows: [],
        adRows: [],
        partnerAds: [],
        featuredAds: [],
        statCounts: [0, 0, 0, 0],
        tickerAdRows: [],
        testimonialRows: [],
      };
    }
  },
  ["homepage-data-v10"],
  { revalidate: 300 },
);

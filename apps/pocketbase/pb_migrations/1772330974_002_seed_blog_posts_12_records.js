/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const record0 = new Record(collection);
    record0.set("title", "The Future of Electric Vehicles");
    record0.set("slug", "future-of-electric-vehicles");
    record0.set("excerpt", "Exploring the latest trends and innovations in EV technology");
    record0.set("content", "Electric vehicles are revolutionizing the automotive industry. From improved battery technology to expanding charging infrastructure, the future looks bright for EVs. Manufacturers are investing heavily in research and development to make electric vehicles more affordable and accessible to the masses.");
    record0.set("author", "CarrVin Team");
    record0.set("category", "Technology");
    record0.set("published", true);
    record0.set("meta_description", "Discover the future of electric vehicles and latest EV innovations");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("title", "Car Maintenance Tips for Winter");
    record1.set("slug", "car-maintenance-tips-winter");
    record1.set("excerpt", "Essential maintenance tips to keep your car running smoothly in winter");
    record1.set("content", "Winter driving can be harsh on your vehicle. Make sure to check your battery, tire pressure, and fluid levels before the cold season arrives. Proper maintenance during winter can prevent breakdowns and extend your vehicle's lifespan.");
    record1.set("author", "CarrVin Team");
    record1.set("category", "Maintenance");
    record1.set("published", true);
    record1.set("meta_description", "Winter car maintenance tips to keep your vehicle in top condition");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("title", "Understanding Car Insurance");
    record2.set("slug", "understanding-car-insurance");
    record2.set("excerpt", "A comprehensive guide to car insurance coverage options");
    record2.set("content", "Car insurance can be confusing with all the different coverage options available. This guide breaks down the basics of liability, collision, comprehensive, and other coverage types to help you make informed decisions about your insurance needs.");
    record2.set("author", "CarrVin Team");
    record2.set("category", "Insurance");
    record2.set("published", true);
    record2.set("meta_description", "Complete guide to understanding car insurance coverage");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("title", "Best Practices for Fuel Efficiency");
    record3.set("slug", "best-practices-fuel-efficiency");
    record3.set("excerpt", "Simple tips to improve your vehicle's fuel economy");
    record3.set("content", "Improving fuel efficiency not only saves you money but also reduces your environmental impact. Regular maintenance, proper tire inflation, and smooth driving habits can significantly improve your vehicle's fuel economy.");
    record3.set("author", "CarrVin Team");
    record3.set("category", "Efficiency");
    record3.set("published", true);
    record3.set("meta_description", "Tips to improve your car's fuel efficiency and save money");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("title", "The Rise of Autonomous Vehicles");
    record4.set("slug", "rise-of-autonomous-vehicles");
    record4.set("excerpt", "How self-driving cars are changing transportation");
    record4.set("content", "Autonomous vehicles are no longer science fiction. Major manufacturers and tech companies are investing billions in developing self-driving technology. This article explores the current state of autonomous vehicles and their potential impact on transportation.");
    record4.set("author", "CarrVin Team");
    record4.set("category", "Technology");
    record4.set("published", true);
    record4.set("meta_description", "Autonomous vehicles and the future of self-driving cars");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("title", "Choosing the Right Car for Your Lifestyle");
    record5.set("slug", "choosing-right-car-lifestyle");
    record5.set("excerpt", "How to select a vehicle that matches your needs");
    record5.set("content", "Choosing a car is a major decision. Consider your lifestyle, budget, and driving habits. Whether you need a fuel-efficient sedan, a spacious SUV, or a reliable truck, this guide will help you find the perfect vehicle for your needs.");
    record5.set("author", "CarrVin Team");
    record5.set("category", "Buying Guide");
    record5.set("published", true);
    record5.set("meta_description", "Guide to choosing the right car for your lifestyle");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("title", "Understanding Vehicle Emissions");
    record6.set("slug", "understanding-vehicle-emissions");
    record6.set("excerpt", "What you need to know about car emissions and environmental impact");
    record6.set("content", "Vehicle emissions contribute to air pollution and climate change. Understanding emissions standards and how to reduce your vehicle's environmental impact is important for both your health and the planet. Modern vehicles are equipped with emission control systems to minimize harmful pollutants.");
    record6.set("author", "CarrVin Team");
    record6.set("category", "Environment");
    record6.set("published", true);
    record6.set("meta_description", "Understanding vehicle emissions and environmental impact");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("title", "Car Detailing: DIY vs Professional");
    record7.set("slug", "car-detailing-diy-vs-professional");
    record7.set("excerpt", "Comparing DIY car detailing with professional services");
    record7.set("content", "Keeping your car clean and well-maintained is important for its longevity and appearance. Learn the differences between DIY detailing and professional services, and decide which option is best for your vehicle and budget.");
    record7.set("author", "CarrVin Team");
    record7.set("category", "Maintenance");
    record7.set("published", true);
    record7.set("meta_description", "Car detailing guide: DIY vs professional services");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("title", "The Evolution of Car Safety Features");
    record8.set("slug", "evolution-car-safety-features");
    record8.set("excerpt", "How vehicle safety technology has advanced over the years");
    record8.set("content", "Modern vehicles are equipped with advanced safety features like airbags, ABS, and collision avoidance systems. This article explores the evolution of car safety technology and how it has made driving safer for everyone.");
    record8.set("author", "CarrVin Team");
    record8.set("category", "Safety");
    record8.set("published", true);
    record8.set("meta_description", "Evolution of car safety features and technology");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("title", "Hybrid vs Electric: Which is Right for You?");
    record9.set("slug", "hybrid-vs-electric-which-right");
    record9.set("excerpt", "Comparing hybrid and electric vehicles to help you decide");
    record9.set("content", "Both hybrid and electric vehicles offer environmental benefits, but they have different advantages and disadvantages. This guide compares the two technologies to help you make an informed decision about which is right for your needs.");
    record9.set("author", "CarrVin Team");
    record9.set("category", "Technology");
    record9.set("published", true);
    record9.set("meta_description", "Hybrid vs electric vehicles comparison guide");
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("title", "Understanding Your Car's Dashboard Lights");
    record10.set("slug", "understanding-car-dashboard-lights");
    record10.set("excerpt", "What those warning lights on your dashboard mean");
    record10.set("content", "Dashboard warning lights can be confusing, but they're important indicators of your vehicle's health. Learn what the most common dashboard lights mean and when you should take your car to a mechanic.");
    record10.set("author", "CarrVin Team");
    record10.set("category", "Maintenance");
    record10.set("published", true);
    record10.set("meta_description", "Guide to understanding car dashboard warning lights");
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("title", "The Impact of Tire Quality on Performance");
    record11.set("slug", "impact-tire-quality-performance");
    record11.set("excerpt", "How tire quality affects your vehicle's performance and safety");
    record11.set("content", "Tires are one of the most important components of your vehicle. Quality tires improve handling, fuel efficiency, and safety. This article explores the impact of tire quality on overall vehicle performance and longevity.");
    record11.set("author", "CarrVin Team");
    record11.set("category", "Maintenance");
    record11.set("published", true);
    record11.set("meta_description", "Impact of tire quality on vehicle performance and safety");
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
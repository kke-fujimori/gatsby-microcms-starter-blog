const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const blogPost = path.resolve(`./src/templates/blog-post.js`)

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
      {
        allMicrocmsBlog(sort: { fields: [createdAt], order: DESC }) {
          edges {
            node {
              id
              blogId
              createdAt
            }
            previous {
              id
            }
            next {
              id
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const edges = result.data.allMicrocmsBlog.edges

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (edges.length > 0) {
    edges.forEach(({ node: post, previous, next }, index) => {
      // const previousPostId = index === 0 ? null : edges[index - 1].id
      const previousPostId = previous ? previous.id : null
      // const nextPostId =
      //   index === edges.length - 1 ? null : edges[index + 1].id
      const nextPostId = next ? next.id : null
      console.log("👺")
      console.log({
        path: post.id,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
      createPage({
        path: post.blogId,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}

// exports.onCreateNode = ({ node, actions, getNode }) => {
//   const { createNodeField } = actions

//   if (node.internal.type === `MicrocmsBlog`) {
//     const value = node.contents.id

//     createNodeField({
//       name: `slug`,
//       node,
//       value,
//     })
//   }
// }

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }
  `)
}

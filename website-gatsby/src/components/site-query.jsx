// This component contains the StaticQuery needed to provide data for the layout components.
// These layout components will then pass some of that information down to the rest of the site
// ie to the table of content, header, etc.

// because this is a StaticQuery it needs to be in the local tree so that its graphQl can be
// run by gatsby. Rather, a file of the same name must have the same query in the local tree.
// During the init process, ocular copies this file over to the local tree. 


import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

// All common metadata, table-of-contents etc are queried here and put in React context
const QUERY = graphql`
  fragment SiteConfigFragment on Site {
    siteMetadata {
      config {
        PROJECT_NAME
        PROJECT_TYPE
        PROJECT_DESC
        HOME_HEADING
        HOME_BULLETS {
          text
          desc
          img
        }
        EXAMPLES {
          title
          path
        }
        THEME_OVERRIDES {
          key
          value
        }
        PROJECTS {
          name
          url
        }
      }
    }
  }

  fragment MarkdownNodeFragment on MarkdownRemark {
    id
    fields {
      slug
    }
    frontmatter {
      title
    }
  }

  query ConfigQuery {
    site {
      ...SiteConfigFragment
    }

    allMarkdown: allMarkdownRemark(limit: 2000) {
      edges {
        node {
          ...MarkdownNodeFragment
        }
      }
    }

    tableOfContents: docsJson {
      chapters {
        title
        level
        chapters {
          title
          level
          entries {
            childMarkdownRemark {
              frontmatter {
                title
              }
              fields {
                slug
              }
            }
          }
        }
        entries {
          childMarkdownRemark {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
        }
      }
    }
  }
`;

// The Layout instance is shared between pages. It queries common, static data
// and makes it available on React context
export default class SiteQuery extends React.Component {
  render() {
    const { onComplete } = this.props;
    return <StaticQuery query={QUERY} render={onComplete} />;
  }
}

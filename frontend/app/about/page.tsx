import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import CustomLayout from "@/components/layout/layout";
import {
  Search,
  Star,
  Edit3,
  Users,
  Zap,
  Globe,
  MessageCircle,
  ImageIcon,
  GitBranch,
} from "lucide-react"

export default function AboutPage() {
  return (
    <CustomLayout>
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Zap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Prompt Stack</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The ultimate platform for creating, sharing, and discovering AI prompts. Join our community of prompt
            engineers and unlock the full potential of AI through collaboration and feedback.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-card border border-border">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  To democratize AI by making high-quality prompts accessible to everyone, fostering innovation and
                  creativity through community-driven feedback and remix culture.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Community</h3>
                  <p className="text-muted-foreground">Connect with fellow prompt engineers and learn from the best</p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <GitBranch className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Remix Culture</h3>
                  <p className="text-muted-foreground">Build upon existing prompts to create even better versions</p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Feedback</h3>
                  <p className="text-muted-foreground">Get valuable feedback and ratings to improve your prompts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Statistics</h2>
            <p className="text-lg text-muted-foreground">Join thousands of users who are already creating amazing prompts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Active Users</div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
                <div className="text-muted-foreground">Prompts Created</div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">25,000+</div>
                <div className="text-muted-foreground">Feedback Given</div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">5,000+</div>
                <div className="text-muted-foreground">Prompts Remixed</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Prompt Stack?</h2>
            <p className="text-lg text-muted-foreground">Everything you need to create, manage, and share AI prompts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 mb-4">
                  <Edit3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Rich Text Editor</h3>
                <p className="text-muted-foreground">Advanced prompt editor with formatting, preview, and image support</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="p-3 bg-green-100 rounded-lg w-12 h-12 mb-4">
                  <GitBranch className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Remix System</h3>
                <p className="text-muted-foreground">Build upon existing prompts to create enhanced versions</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="p-3 bg-purple-100 rounded-lg w-12 h-12 mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Rating System</h3>
                <p className="text-muted-foreground">Community-driven 5-star rating system with detailed feedback</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="p-3 bg-yellow-100 rounded-lg w-12 h-12 mb-4">
                  <Search className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Discovery</h3>
                <p className="text-muted-foreground">Find prompts using tags, content search, and advanced filters</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="p-3 bg-red-100 rounded-lg w-12 h-12 mb-4">
                  <ImageIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Image Support</h3>
                <p className="text-muted-foreground">Add images to your prompts for better context and visual appeal</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <div className="p-3 bg-indigo-100 rounded-lg w-12 h-12 mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Google Integration</h3>
                <p className="text-muted-foreground">Sign in with Google for seamless authentication and sync</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-card border border-border">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join Prompt Stack today and start creating, sharing, and discovering amazing AI prompts
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/login">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-secondary hover:text-accent-foreground"
                    variant="secondary"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    className="hover:bg-muted hover:text-muted-foreground bg-secondary"
                    variant="outline"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </CustomLayout>
  )
}

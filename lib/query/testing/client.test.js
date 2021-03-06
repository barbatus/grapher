import { createQuery } from 'meteor/cultofcoders:grapher';
import './units/deepClone';

describe('Query Client Tests', function () {
    it('Should work with queries via method call', function (done) {
        const query = createQuery({
            posts: {
                $options: {limit: 5},
                title: 1,
                comments: {
                    $filters: {text: 'Good'},
                    text: 1
                }
            }
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);

            assert.isArray(res);
            _.each(res, post => {
                assert.isString(post.title);
                assert.isString(post._id);
                _.each(post.comments, comment => {
                    assert.isString(comment._id);
                    assert.equal('Good', comment.text);
                })
            });

            done();
        });
    });

    it('Should work with queries reactively', function (done) {
        const query = createQuery({
            posts: {
                $options: {limit: 5},
                title: 1,
                comments: {
                    $filters: {text: 'Good'},
                    text: 1
                }
            }
        });

        const handle = query.subscribe();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();

                const res = query.fetch();

                assert.isArray(res);
                _.each(res, post => {
                    assert.isString(post.title);
                    assert.isString(post._id);
                    _.each(post.comments, comment => {
                        assert.isString(comment._id);
                        assert.equal('Good', comment.text);
                    })
                });

                handle.stop();
                done();
            }
        })
    });


    it('Should fetch direct One links with $metadata via Subscription', function (done) {
        let query = createQuery({
            posts: {
                group: {
                    name: 1
                }
            }
        });

        let handle = query.subscribe();
        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();
                let data = query.fetch();

                handle.stop();

                _.each(data, post => {
                    assert.isObject(post.group.$metadata);
                    assert.isDefined(post.group.$metadata.random);
                });

                done();
            }
        })
    });

    it('Should fetch direct Many links with $metadata via Subscription', function (done) {
        let query = createQuery({
            authors: {
                groups: {
                    $options: {limit: 1},
                    name: 1
                }
            }
        });

        let handle = query.subscribe();
        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();
                let data = query.fetch();

                handle.stop();

                _.each(data, author => {
                    assert.isArray(author.groups);

                    _.each(author.groups, group => {
                        assert.isObject(group.$metadata);
                    })
                })

                done();
            }
        })
    });

    it('Should fetch Inversed One Meta links with $metadata via Subscription', function (done) {
        let query = createQuery({
            groups: {
                posts: {
                    title: 1
                }
            }
        });

        let handle = query.subscribe();

        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();

                let data = query.fetch();
                handle.stop();

                _.each(data, group => {
                    _.each(group.posts, post => {
                        assert.isObject(post.$metadata);
                        assert.isDefined(post.$metadata.random);
                    })
                });


                done();
            }
        });
    });

    it('Should fetch Inversed Many Meta links with $metadata via Subscription', function (done) {
        let query = createQuery({
            groups: {
                authors: {
                    $options: {limit: 1},
                    name: 1
                }
            }
        });

        let handle = query.subscribe();

        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();

                let data = query.fetch();

                _.each(data, group => {
                    _.each(group.authors, author => {
                        assert.isObject(author.$metadata);
                    });
                });

                done();
                handle.stop();
            }
        });
    });
});